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
