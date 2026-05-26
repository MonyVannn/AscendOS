import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  fieldTrainerDripSchema,
  buildFieldTrainerReassignPayload,
} from "@/lib/ghl/field-trainer-drip";
import { postGhlWithRetry, logSubmission } from "@/lib/ghl/webhook-client";
import { FIELD_TRAINER_FORM_LABELS } from "@/lib/ghl/field-trainer-forms";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken({ template: "convex" });
    const [tenant, webhookUrl] = await Promise.all([
      fetchQuery(
        api.tenant.getTenantContext,
        {},
        { token: token ?? undefined }
      ),
      fetchQuery(
        api.ghlInbound.readInboundWebhookUrl,
        { key: "field-trainer-drip" },
        { token: token ?? undefined }
      )
    ]);

    if (!tenant || !tenant.user) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "GHL inbound webhook URL is not configured for your agency." },
        { status: 422 }
      );
    }

    const { user, agency } = tenant;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = fieldTrainerDripSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const timeoutMs = parseInt(process.env.GHL_REQUEST_TIMEOUT_MS || "5000", 10);
    const retryDelayMs = parseInt(process.env.GHL_RETRY_DELAY_MS || "1000", 10);

    const payload = buildFieldTrainerReassignPayload(
      parsed.data,
      { name: user.name || "", email: user.email || "", bookingLink: user.bookingLink || "" }
    );

    const startTime = Date.now();
    const result = await postGhlWithRetry(webhookUrl, payload, timeoutMs, retryDelayMs);
    const latency_ms = Date.now() - startTime;

    logSubmission({
      event: result.ok ? "ghl_submission_success" : "ghl_submission_failed",
      agency_id: agency?.slug,
      user_id: userId,
      destination: "ghl_inbound_webhook",
      integration_key: "field-trainer-reassign",
      template: FIELD_TRAINER_FORM_LABELS.reassignTrainer,
      ghl_status: result.status,
      retry: result.retry,
      latency_ms,
    });

    if (agency) {
      try {
        const logResult = await fetchMutation(api.activityLog.recordSubmission, {
          agencyId: agency._id,
          userId: user._id,
          toolName: "field-trainer",
          templateName: FIELD_TRAINER_FORM_LABELS.reassignTrainer,
          contactEmail: parsed.data.phone, // Reusing email column for the contact identifier
          contactName: parsed.data.first_name,
          ghlStatus: result.status ?? 0,
          success: result.ok,
          retried: result.retry,
          errorMessage: result.ok ? undefined : result.errorMessage,
          latencyMs: latency_ms,
        }, { token: token ?? undefined });

        if (result.ok) {
          await fetchMutation(api.fieldTrainer.applyEnrollmentFromSubmission, {
            agencyId: agency._id,
            userId: user._id,
            phone: parsed.data.phone,
            firstName: parsed.data.first_name,
            eventType: "reassigned_trainer",
            fieldTrainer: parsed.data.trainer as any,
            webhookLogId: logResult.id,
          }, { token: token ?? undefined });
        }
      } catch (logErr) {
        console.error("Failed to record submission or enrollment in Convex:", logErr);
      }
    }

    if (result.ok) {
      return NextResponse.json({ success: true });
    }

    if (result.status && result.status >= 400 && result.status < 500) {
      return NextResponse.json(
        { error: "Submission rejected by GHL" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "GHL unavailable. Try again." },
      { status: 502 }
    );
  } catch (error) {
    console.error("Unexpected error in field-trainer-reassign proxy:", error);
    return NextResponse.json(
      { error: "Unexpected error. Contact support." },
      { status: 500 }
    );
  }
}
