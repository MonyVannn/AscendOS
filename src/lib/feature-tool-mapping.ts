/** Maps feature registry keys to webhook log `toolName` values. */
export const FEATURE_TO_TOOL_NAME: Record<string, string> = {
  "send-email-template": "email-template",
  "beast-mode-drip": "beast-mode-drip",
  "onboarding-drip": "onboarding-drip",
};

/** Maps feature registry keys to GHL inbound webhook registry keys. */
export const FEATURE_TO_WEBHOOK_KEY: Record<string, string> = {
  "send-email-template": "send-email-template",
  "beast-mode-drip": "beast-mode-drip",
  "onboarding-drip": "onboarding-drip",
};

/** Human-readable labels for webhook log toolName values. */
export const TOOL_NAME_LABELS: Record<string, string> = {
  "email-template": "Email Template",
  "beast-mode-drip": "Beast Mode Drip",
  "onboarding-drip": "Onboarding Drip",
};

export function getToolNameForFeature(featureKey: string): string | undefined {
  return FEATURE_TO_TOOL_NAME[featureKey];
}

export function getWebhookKeyForFeature(featureKey: string): string | undefined {
  return FEATURE_TO_WEBHOOK_KEY[featureKey];
}

export function getToolDisplayName(toolName: string): string {
  return TOOL_NAME_LABELS[toolName] ?? toolName;
}

/** Features with implemented dashboard pages (MVP). */
export const IMPLEMENTED_FEATURE_KEYS = new Set(["send-email-template"]);

export function isFeatureImplemented(featureKey: string): boolean {
  return IMPLEMENTED_FEATURE_KEYS.has(featureKey);
}
