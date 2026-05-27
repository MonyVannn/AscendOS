import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { postGhlWithRetry, logSubmission } from "@/lib/ghl/webhook-client";
import { z } from "zod";

const shareResourceSchema = z.object({
  resourceId: z.string(),
  first_name: z.string().trim().optional(),
  email: z.string().trim().min(1, "Email or phone is required"),
});

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
        { key: "share-resource" },
        { token: token ?? undefined }
      )
    ]);

    if (!tenant || !tenant.user) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "GHL inbound webhook URL is not configured for your agency for 'share-resource'." },
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

    const parsed = shareResourceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Create the contact share in Convex
    const { token: shareToken } = await fetchMutation(
      api.resourceShares.createContactShare,
      {
        resourceId: parsed.data.resourceId as any,
        contactEmail: parsed.data.email,
        contactName: parsed.data.first_name,
      },
      { token: token ?? undefined }
    );

    // Build the payload for GHL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.ascendos.com";
    const shareUrl = `${appUrl}/share/${shareToken}`;

    const payload = {
      first_name: parsed.data.first_name || "",
      email: parsed.data.email,
      "contact.shareUrl": shareUrl,
      "contact.assigned_agent_name": user.name || "",
      "contact.assigned_agent_email": user.email || "",
      "contact.assigned_agent_booking_link": user.bookingLink || "",
      agency_id: agency?.slug,
    };

    const timeoutMs = parseInt(process.env.GHL_REQUEST_TIMEOUT_MS || "5000", 10);
    const retryDelayMs = parseInt(process.env.GHL_RETRY_DELAY_MS || "1000", 10);

    const startTime = Date.now();
    const result = await postGhlWithRetry(webhookUrl, payload, timeoutMs, retryDelayMs);
    const latency_ms = Date.now() - startTime;

    logSubmission({
      event: result.ok ? "ghl_submission_success" : "ghl_submission_failed",
      agency_id: agency?.slug,
      user_id: userId,
      destination: "ghl_inbound_webhook",
      integration_key: "share-resource",
      template: parsed.data.resourceId,
      ghl_status: result.status,
      retry: result.retry,
      latency_ms,
    });

    if (agency) {
      try {
        await fetchMutation(
          api.activityLog.recordSubmission,
          {
            agencyId: agency._id,
            userId: user._id,
            toolName: "share-resource",
            contactEmail: parsed.data.email,
            contactName: parsed.data.first_name,
            ghlStatus: result.status ?? 0,
            success: result.ok,
            retried: result.retry,
            errorMessage: result.ok ? undefined : result.errorMessage,
            latencyMs: latency_ms,
          },
          { token: token ?? undefined }
        );
      } catch (logErr) {
        console.error("Failed to record submission log in Convex:", logErr);
      }
    }

    if (!result.ok) {
      if (result.status === 400 || result.status === 422) {
        return NextResponse.json(
          { error: "Submission rejected by GHL" },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: "GHL unavailable. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, shareUrl });
  } catch (error) {
    console.error("Error in share-resource route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
