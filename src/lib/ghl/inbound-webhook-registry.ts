export const GHL_INBOUND_WEBHOOK_KEYS = [
  {
    key: "send-email-template",
    label: "Send Email Template",
    description:
      "Powers the Send Email Template tool in the RD dashboard.",
  },
] as const;

export type GhlInboundWebhookKey =
  (typeof GHL_INBOUND_WEBHOOK_KEYS)[number]["key"];

const registryByKey: Map<string, (typeof GHL_INBOUND_WEBHOOK_KEYS)[number]> =
  new Map(GHL_INBOUND_WEBHOOK_KEYS.map((entry) => [entry.key, entry]));

export function getWebhookRegistryEntry(key: string) {
  return registryByKey.get(key);
}

export function isKnownWebhookKey(key: string): key is GhlInboundWebhookKey {
  return registryByKey.has(key);
}
