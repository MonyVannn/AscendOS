import { z } from "zod";

export const GHL_EMAIL_TEMPLATE_OPTIONS = [
  { label: "Ask For Referrals (from contact)", value: "Ask For Referrals (from contact)" },
  { label: "Client-Purchased Thank You", value: "Client-Purchased Thank You" },
  { label: "Client-Claim", value: "Client-Claim" },
  { label: "Client-Testimonial / Review", value: "Client-Testimonial / Review" },
  { label: "Client-Cancel Request", value: "Client-Cancel Request" },
  { label: "Bus. Follow-Up", value: "Bus. Follow-Up" },
  { label: "Bus. Owner/HR - Thank You", value: "Bus. Owner/HR - Thank You" },
  { label: "Bus. Owner/HR - Funded", value: "Bus. Owner/HR - Funded - Thank You" },
  { label: "Agent-Send Quick Start Content", value: "Agent-Send Quick Start Congrats" },
  { label: "Send COV", value: "Send COV" },
  // Unchanged until GHL branches exist:
  { label: "Client-CompetitorEmail", value: "Client-CompetitorEmail" },
  { label: "Bus. Owner/HR - Group Note", value: "Bus. Owner/HR - Group Note" },
  { label: "Recruit-Career Overview Email", value: "Recruit-Career Overview Email" },
] as const;

export const GHL_EMAIL_TEMPLATES = [
  "Ask For Referrals (from contact)",
  "Client-Purchased Thank You",
  "Client-Claim",
  "Client-Testimonial / Review",
  "Client-Cancel Request",
  "Bus. Follow-Up",
  "Bus. Owner/HR - Thank You",
  "Bus. Owner/HR - Funded - Thank You",
  "Agent-Send Quick Start Congrats",
  "Send COV",
  "Client-CompetitorEmail",
  "Bus. Owner/HR - Group Note",
  "Recruit-Career Overview Email",
] as const;

export const sendEmailTemplateSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  email: z.string().trim().email("Invalid email address"),
  companyName: z.string().trim().optional(),
  dgemailtemplate: z.enum(GHL_EMAIL_TEMPLATES, {
    message: "Invalid template selected",
  }),
});

export type SendEmailTemplateInput = z.infer<typeof sendEmailTemplateSchema>;

export function buildMergedPayload(
  input: SendEmailTemplateInput,
  agent: { name: string; email: string; bookingLink: string }
) {
  return {
    first_name: input.first_name,
    email: input.email,
    companyName: input.companyName || "",
    "contact.dgemailtemplate": input.dgemailtemplate,
    "contact.assigned_agent_name": agent.name,
    "contact.assigned_agent_email": agent.email,
    "contact.assigned_agent_booking_link": agent.bookingLink,
  };
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function postGhlSubmitOnce(
  endpoint: string,
  payload: Record<string, unknown>,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function postGhlWithRetry(
  endpoint: string,
  payload: Record<string, unknown>,
  timeoutMs: number,
  retryDelayMs: number
): Promise<{ ok: boolean; status: number | null; retry: boolean; errorMessage?: string }> {
  let lastError: string | undefined;

  try {
    const res = await postGhlSubmitOnce(endpoint, payload, timeoutMs);
    if (res.ok) {
      return { ok: true, status: res.status, retry: false };
    }
    const text = await res.text().catch(() => "");
    lastError = text ? text.substring(0, 500) : `HTTP ${res.status}`;
    
    if (res.status >= 400 && res.status < 500) {
      return { ok: false, status: res.status, retry: false, errorMessage: lastError };
    }
    // 5xx -> fall through to retry
  } catch (err: unknown) {
    lastError = err instanceof Error ? err.message : "Network error";
    // Timeout or network error -> fall through to retry
  }

  await sleep(retryDelayMs);

  try {
    const res2 = await postGhlSubmitOnce(endpoint, payload, timeoutMs);
    if (res2.ok) {
      return { ok: true, status: res2.status, retry: true };
    }
    const text = await res2.text().catch(() => "");
    const errorMsg = text ? text.substring(0, 500) : `HTTP ${res2.status}`;
    return { ok: false, status: res2.status, retry: true, errorMessage: errorMsg };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error";
    return { ok: false, status: null, retry: true, errorMessage: errorMsg };
  }
}

export function logSubmission(log: {
  event: "ghl_submission_success" | "ghl_submission_failed";
  agency_id?: string;
  user_id: string;
  destination: string;
  integration_key?: string;
  template: string;
  ghl_status: number | null;
  retry: boolean;
  latency_ms: number;
}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...log,
    })
  );
}
