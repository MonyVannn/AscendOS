"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GHL_INBOUND_WEBHOOK_KEYS,
  getWebhookRegistryEntry,
} from "@/lib/ghl/inbound-webhook-registry";

type WebhookRow = {
  key: string;
  url: string;
  updatedAt?: number;
  source: "keyed" | "legacy";
  webhookId?: Id<"agencyGhlInboundWebhooks">;
};

function buildDisplayRows(webhooks: WebhookRow[]): WebhookRow[] {
  const byKey = new Map(webhooks.map((w) => [w.key, w]));
  const rows: WebhookRow[] = [];

  for (const entry of GHL_INBOUND_WEBHOOK_KEYS) {
    rows.push(
      byKey.get(entry.key) ?? {
        key: entry.key,
        url: "",
        source: "keyed",
      }
    );
    byKey.delete(entry.key);
  }

  for (const [, extra] of byKey) {
    rows.push(extra);
  }

  return rows;
}

export function AgencyWebhooksClient({ agencyId }: { agencyId: string }) {
  const { isAuthenticated } = useConvexAuth();
  const agencyIdTyped = agencyId as Id<"agencies">;

  const data = useQuery(
    api.admin.listAgencyInboundWebhooks,
    isAuthenticated ? { agencyId: agencyIdTyped } : "skip"
  );
  const upsert = useMutation(api.admin.upsertAgencyInboundWebhook);
  const remove = useMutation(api.admin.deleteAgencyInboundWebhook);
  const toggleIntegration = useMutation(api.admin.toggleAgencyIntegration);

  const [draftUrls, setDraftUrls] = React.useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const [deletingKey, setDeletingKey] = React.useState<string | null>(null);
  const [togglingKey, setTogglingKey] = React.useState<string | null>(null);
  const [banner, setBanner] = React.useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  // Custom webhook state
  const [isAddingCustom, setIsAddingCustom] = React.useState(false);
  const [customKey, setCustomKey] = React.useState("");
  const [customUrl, setCustomUrl] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  const displayRows = React.useMemo(
    () => (data ? buildDisplayRows(data.webhooks) : []),
    [data]
  );

  React.useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const row of buildDisplayRows(data.webhooks)) {
      next[row.key] = row.url;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftUrls(next);
  }, [data]);

  if (data === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  const handleSave = async (key: string) => {
    const url = (draftUrls[key] ?? "").trim();
    if (!url) {
      setBanner({ type: "error", message: "Webhook URL cannot be empty" });
      return;
    }

    setSavingKey(key);
    setBanner(null);
    try {
      await upsert({ agencyId: agencyIdTyped, key, url });
      setBanner({ type: "success", message: `Saved webhook for ${key}` });
    } catch (err: unknown) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save webhook",
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleDelete = async (row: WebhookRow) => {
    const hasConfigured =
      row.source === "legacy" || row.webhookId !== undefined;
    if (!hasConfigured) return;

    const label = getWebhookRegistryEntry(row.key)?.label ?? row.key;
    if (
      !window.confirm(
        `Remove the ${label} webhook for ${data.agency.name}? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingKey(row.key);
    setBanner(null);
    try {
      await remove({ agencyId: agencyIdTyped, key: row.key });
      setDraftUrls((prev) => ({ ...prev, [row.key]: "" }));
      setBanner({ type: "success", message: `Removed webhook for ${row.key}` });
    } catch (err: unknown) {
      setBanner({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to delete webhook",
      });
    } finally {
      setDeletingKey(null);
    }
  };

  const handleAddCustom = async () => {
    const key = customKey.trim();
    const url = customUrl.trim();
    if (!key || !url) {
      setBanner({ type: "error", message: "Key and URL are required" });
      return;
    }

    setIsAdding(true);
    setBanner(null);
    try {
      await upsert({ agencyId: agencyIdTyped, key, url });
      setBanner({ type: "success", message: `Added webhook for ${key}` });
      setCustomKey("");
      setCustomUrl("");
      setIsAddingCustom(false);
    } catch (err: unknown) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to add webhook",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto h-full flex flex-col pb-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Agency Webhooks
          </h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            Integrations enable GHL webhooks. To show tools in the RD dashboard, enable the corresponding <strong>Features</strong> above.
          </p>
        </div>
      </div>

      {banner ? (
        <div
          role="alert"
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            banner.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {banner.message}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[minmax(180px,1fr)_2fr_auto] gap-4 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            Integration
          </span>
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            Webhook URL
          </span>
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase text-right">
            Actions
          </span>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {displayRows.map((row) => {
            const registry = getWebhookRegistryEntry(row.key);
            const label = registry?.label ?? row.key;
            const isLegacy = row.source === "legacy";
            const isConfigured =
              isLegacy || row.webhookId !== undefined;
            const isSaving = savingKey === row.key;
            const isDeleting = deletingKey === row.key;

            const isRegistryEntry = registry !== undefined;
            const isEnabled = isRegistryEntry ? data.enabledIntegrationKeys.includes(row.key) : true;
            const isToggling = togglingKey === row.key;

            return (
              <div
                key={row.key}
                className={`grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_2fr_auto] gap-4 px-6 py-5 items-start ${
                  !isEnabled ? "opacity-60 grayscale-[0.5]" : ""
                }`}
              >
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">
                    {label}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded w-max">
                    {row.key}
                  </div>
                  {registry?.description ? (
                    <p className="text-xs text-zinc-500 mt-1">
                      {registry.description}
                    </p>
                  ) : null}
                  {isLegacy ? (
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] border-amber-200 bg-amber-50 text-amber-800"
                    >
                      Legacy — save to migrate
                    </Badge>
                  ) : null}
                </div>

                <Input
                  value={draftUrls[row.key] ?? ""}
                  onChange={(e) =>
                    setDraftUrls((prev) => ({
                      ...prev,
                      [row.key]: e.target.value,
                    }))
                  }
                  placeholder="https://services.msgsndr.com/hooks/..."
                  className="bg-zinc-50 font-mono text-sm"
                  disabled={isSaving || isDeleting}
                />

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {isRegistryEntry && (
                    <Button
                      type="button"
                      variant={isEnabled ? "default" : "secondary"}
                      size="sm"
                      disabled={isToggling || isSaving || isDeleting}
                      onClick={async () => {
                        setTogglingKey(row.key);
                        try {
                          await toggleIntegration({
                            agencyId: agencyIdTyped,
                            key: row.key,
                            isEnabled: !isEnabled,
                          });
                        } catch (err: unknown) {
                          setBanner({
                            type: "error",
                            message: err instanceof Error ? err.message : "Failed to toggle integration",
                          });
                        } finally {
                          setTogglingKey(null);
                        }
                      }}
                      className={isEnabled ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                      {isToggling ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
                      {isEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSaving || isDeleting}
                    onClick={() => handleSave(row.key)}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!isConfigured || isSaving || isDeleting}
                    onClick={() => handleDelete(row)}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-t border-zinc-200 dark:border-zinc-800">
          {!isAddingCustom ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCustom(true)}
              className="text-zinc-600 dark:text-zinc-400"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Custom Webhook
            </Button>
          ) : (
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <Input
                placeholder="Integration Key (e.g. custom-crm)"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="font-mono text-sm md:max-w-xs bg-white dark:bg-zinc-950"
                disabled={isAdding}
              />
              <Input
                placeholder="Webhook URL"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="font-mono text-sm bg-white dark:bg-zinc-950"
                disabled={isAdding}
              />
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={handleAddCustom} disabled={isAdding}>
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingCustom(false)}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-6" />
      <p className="text-xs text-zinc-500">
        Keyed webhooks are used by tenant tools at runtime. Saving a legacy
        webhook migrates it to keyed storage and clears the deprecated agency
        field.
      </p>
    </div>
  );
}
