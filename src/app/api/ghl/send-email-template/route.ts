import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  sendEmailTemplateSchema,
  buildMergedPayload,
  postGhlWithRetry,
  logSubmission,
} from "@/lib/ghl/send-email-template";

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
        { key: "send-email-template" },
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

    // Check profile completeness
    if (!user.name?.trim() || !user.email?.trim() || !user.bookingLink?.trim()) {
      return NextResponse.json(
        { error: "Your profile is incomplete. Update your settings before sending." },
        { status: 422 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = sendEmailTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const timeoutMs = parseInt(process.env.GHL_REQUEST_TIMEOUT_MS || "5000", 10);
    const retryDelayMs = parseInt(process.env.GHL_RETRY_DELAY_MS || "1000", 10);

    const payload = buildMergedPayload(
      parsed.data,
      { name: user.name, email: user.email, bookingLink: user.bookingLink }
    );

    const startTime = Date.now();
    const result = await postGhlWithRetry(webhookUrl, payload, timeoutMs, retryDelayMs);
    const latency_ms = Date.now() - startTime;

    logSubmission({
      event: result.ok ? "ghl_submission_success" : "ghl_submission_failed",
      agency_id: agency?.slug,
      user_id: userId,
      destination: "ghl_inbound_webhook",
      integration_key: "send-email-template",
      template: parsed.data.dgemailtemplate,
      ghl_status: result.status,
      retry: result.retry,
      latency_ms,
    });

    if (agency) {
      try {
        await fetchMutation(api.activityLog.recordSubmission, {
          agencyId: agency._id,
          userId: user._id,
          toolName: "email-template",
          templateName: parsed.data.dgemailtemplate,
          contactEmail: parsed.data.email,
          contactName: parsed.data.first_name,
          ghlStatus: result.status ?? 0,
          success: result.ok,
          retried: result.retry,
          errorMessage: result.ok ? undefined : result.errorMessage,
          latencyMs: latency_ms,
        }, { token: token ?? undefined });
      } catch (logErr) {
        console.error("Failed to record submission log in Convex:", logErr);
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
    console.error("Unexpected error in send-email-template proxy:", error);
    return NextResponse.json(
      { error: "Unexpected error. Contact support." },
      { status: 500 }
    );
  }
}
