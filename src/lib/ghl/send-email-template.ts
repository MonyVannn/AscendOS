import { z } from "zod";

export const GHL_EMAIL_TEMPLATES = [
  "Ask For Referrals (from contact)",
  "Client-Purchased Thank You",
  "Client-Claim",
  "Client-Testimonial / Review",
  "Client-CompetitorEmail",
  "Client-Cancel Request",
  "Bus. Follow-Up",
  "Bus. Owner/HR - Thank You",
  "Bus. Owner/HR - Funded",
  "Bus. Owner/HR - Group Note",
  "Recruit-Career Overview Email",
  "Agent-Send Quick Start Content",
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
  payload: Record<string, any>,
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
  payload: Record<string, any>,
  timeoutMs: number,
  retryDelayMs: number
) {
  try {
    const res = await postGhlSubmitOnce(endpoint, payload, timeoutMs);
    if (res.ok) {
      return { ok: true, status: res.status, retry: false };
    }
    if (res.status >= 400 && res.status < 500) {
      return { ok: false, status: res.status, retry: false };
    }
    // 5xx -> fall through to retry
  } catch (err: any) {
    // Timeout or network error -> fall through to retry
  }

  await sleep(retryDelayMs);

  try {
    const res2 = await postGhlSubmitOnce(endpoint, payload, timeoutMs);
    return { ok: res2.ok, status: res2.status, retry: true };
  } catch (err: any) {
    return { ok: false, status: null, retry: true };
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
