import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sendEmailTemplateSchema,
  buildMergedPayload,
} from "./send-email-template";
import { postGhlWithRetry } from "./webhook-client";

describe("sendEmailTemplateSchema", () => {
  it("validates correct input", () => {
    const valid = {
      first_name: "Jane",
      email: "jane@example.com",
      companyName: "Acme",
      dgemailtemplate: "Ask For Referrals (from contact)",
    };
    const result = sendEmailTemplateSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const invalid = {
      first_name: "Jane",
      email: "not-an-email",
      dgemailtemplate: "Ask For Referrals (from contact)",
    };
    const result = sendEmailTemplateSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects invalid template", () => {
    const invalid = {
      first_name: "Jane",
      email: "jane@example.com",
      dgemailtemplate: "Not A Real Template",
    };
    const result = sendEmailTemplateSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("requires first_name", () => {
    const invalid = {
      first_name: "   ",
      email: "jane@example.com",
      dgemailtemplate: "Ask For Referrals (from contact)",
    };
    const result = sendEmailTemplateSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("buildMergedPayload", () => {
  it("merges client and agent data correctly", () => {
    const input = {
      first_name: "Jane",
      email: "jane@example.com",
      companyName: "Acme",
      dgemailtemplate: "Ask For Referrals (from contact)" as const,
    };
    const agent = {
      name: "Agent Smith",
      email: "agent@example.com",
      bookingLink: "https://book.me",
    };

    const payload = buildMergedPayload(input, agent);

    expect(payload).toEqual({
      first_name: "Jane",
      email: "jane@example.com",
      companyName: "Acme",
      "contact.dgemailtemplate": "Ask For Referrals (from contact)",
      "contact.assigned_agent_name": "Agent Smith",
      "contact.assigned_agent_email": "agent@example.com",
      "contact.assigned_agent_booking_link": "https://book.me",
    });
  });
});

describe("postGhlWithRetry", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns success on 200", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    const result = await postGhlWithRetry("http://example.com", {}, 1000, 10);
    expect(result).toEqual({ ok: true, status: 200, retry: false });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not retry on 400", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ 
      ok: false, 
      status: 400,
      text: async () => "Bad Request" 
    } as unknown as Response);

    const result = await postGhlWithRetry("http://example.com", {}, 1000, 10);
    expect(result).toEqual({ ok: false, status: 400, retry: false, errorMessage: "Bad Request" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on 503 and succeeds", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    const result = await postGhlWithRetry("http://example.com", {}, 1000, 10);
    expect(result).toEqual({ ok: true, status: 200, retry: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retries on network error and fails", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockRejectedValueOnce(new Error("fetch failed"));

    const result = await postGhlWithRetry("http://example.com", {}, 1000, 10);
    expect(result).toEqual({ ok: false, status: null, retry: true, errorMessage: "fetch failed" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
