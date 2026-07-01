import { Id } from "../_generated/dataModel";
import { DatabaseReader, DatabaseWriter } from "../_generated/server";

export const KNOWN_INTEGRATION_KEYS = [
  "beast-mode-drip",
  "send-email-template",
  "field-trainer-drip",
  "field-trainer-reposition",
  "remove-agent",
];

export async function getActiveIntegrationKeys(db: DatabaseReader): Promise<string[]> {
  const integrations = await db.query("integrations").collect();
  return integrations.filter(i => i.isActive).map(i => i.key);
}

export async function isIntegrationEnabled(
  db: DatabaseReader,
  agencyId: Id<"agencies">,
  key: string
): Promise<boolean> {
  const row = await db
    .query("agencyIntegrationEntitlements")
    .withIndex("by_agency_and_key", (q) =>
      q.eq("agencyId", agencyId).eq("key", key)
    )
    .first();

  return row?.isEnabled ?? false;
}

export async function getEnabledIntegrationKeys(
  db: DatabaseReader,
  agencyId: Id<"agencies">
): Promise<string[]> {
  const rows = await db
    .query("agencyIntegrationEntitlements")
    .withIndex("by_agency", (q) => q.eq("agencyId", agencyId))
    .collect();

  return rows.filter((r) => r.isEnabled).map((r) => r.key);
}

export async function setIntegrationEnabled(
  db: DatabaseWriter,
  agencyId: Id<"agencies">,
  key: string,
  isEnabled: boolean
) {
  const existing = await db
    .query("agencyIntegrationEntitlements")
    .withIndex("by_agency_and_key", (q) =>
      q.eq("agencyId", agencyId).eq("key", key)
    )
    .first();

  if (existing) {
    await db.patch(existing._id, {
      isEnabled,
      updatedAt: Date.now(),
    });
  } else {
    await db.insert("agencyIntegrationEntitlements", {
      agencyId,
      key,
      isEnabled,
      updatedAt: Date.now(),
    });
  }
}