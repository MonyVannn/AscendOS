"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Loader2, Plus, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function AgencyToolsClient({ agencyId }: { agencyId: string }) {
  const { isAuthenticated } = useConvexAuth();
  const agencyIdTyped = agencyId as Id<"agencies">;

  const data = useQuery(
    api.admin.listAgencyTools,
    isAuthenticated ? { agencyId: agencyIdTyped } : "skip"
  );
  
  const setToolEnabled = useMutation(api.admin.setAgencyToolEnabled);
  const upsertWebhook = useMutation(api.admin.upsertAgencyInboundWebhook);
  const removeWebhook = useMutation(api.admin.deleteAgencyInboundWebhook);

  const [togglingKey, setTogglingKey] = React.useState<string | null>(null);
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const [deletingKey, setDeletingKey] = React.useState<string | null>(null);
  const [draftUrls, setDraftUrls] = React.useState<Record<string, string>>({});
  const [banner, setBanner] = React.useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const tool of data.tools) {
      for (const [key, url] of Object.entries(tool.urls)) {
        next[key] = url;
      }
    }
    setDraftUrls(next);
  }, [data]);

  if (data === undefined) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  const handleToggle = async (featureKey: string, isEnabled: boolean) => {
    setTogglingKey(featureKey);
    setBanner(null);
    try {
      await setToolEnabled({
        agencyId: agencyIdTyped,
        featureKey,
        isEnabled,
      });
      setBanner({ type: "success", message: `Tool ${isEnabled ? 'enabled' : 'disabled'} successfully.` });
    } catch (err: unknown) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to toggle tool.",
      });
    } finally {
      setTogglingKey(null);
    }
  };

  const handleSaveWebhook = async (key: string) => {
    const url = (draftUrls[key] ?? "").trim();
    if (!url) {
      setBanner({ type: "error", message: "Webhook URL cannot be empty" });
      return;
    }

    setSavingKey(key);
    setBanner(null);
    try {
      await upsertWebhook({ agencyId: agencyIdTyped, key, url });
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

  const handleDeleteWebhook = async (key: string) => {
    if (!window.confirm(`Remove this webhook URL? This cannot be undone.`)) {
      return;
    }

    setDeletingKey(key);
    setBanner(null);
    try {
      await removeWebhook({ agencyId: agencyIdTyped, key });
      setDraftUrls((prev) => ({ ...prev, [key]: "" }));
      setBanner({ type: "success", message: `Removed webhook for ${key}` });
    } catch (err: unknown) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete webhook",
      });
    } finally {
      setDeletingKey(null);
    }
  };

  const toolsByPillar = data.tools.reduce((acc, tool) => {
    if (!acc[tool.pillar]) acc[tool.pillar] = [];
    acc[tool.pillar].push(tool);
    return acc;
  }, {} as Record<string, typeof data.tools>);

  const pillars = ["recruit", "train", "sell", "team", "account", "tools"];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      <div className="mb-6">
        <Link
          href="/admin/agencies"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agencies
        </Link>
        <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
          Agency Settings
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          {data.agency.name}
        </h1>
        <p className="text-sm text-zinc-500 font-mono mt-1">{data.agency.slug}</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">Agency Tools</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            Manage which tools are visible in the RD dashboard and configure their GHL webhooks. 
            <strong> Fully live</strong> tools are visible and have all required webhooks configured.
          </p>
        </div>
      </div>

      {banner ? (
        <div
          role="alert"
          className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-3 ${
            banner.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {banner.type === "error" ? (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <div>{banner.message}</div>
        </div>
      ) : null}

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {pillars.map((pillar) => {
          const tools = toolsByPillar[pillar];
          if (!tools || tools.length === 0) return null;

          return (
            <div key={pillar}>
              <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  {pillar}
                </h3>
              </div>
              
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tools.map((tool) => {
                  const isToggling = togglingKey === tool.key;
                  const isEnabled = tool.isFeatureEnabled;

                  return (
                    <div
                      key={tool.key}
                      className={`flex flex-col gap-4 px-6 py-5 ${
                        !isEnabled ? "opacity-75 bg-zinc-50/50 dark:bg-zinc-900/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                            {tool.label}
                            {tool.status === "live" && (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                Fully live
                              </Badge>
                            )}
                            {tool.status === "visible" && (
                              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                                Visible only
                              </Badge>
                            )}
                            {tool.status === "off" && (
                              <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-600 border-zinc-200">
                                Off
                              </Badge>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded w-max">
                            {tool.key}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant={isEnabled ? "default" : "secondary"}
                          size="sm"
                          disabled={isToggling}
                          onClick={() => handleToggle(tool.key, !isEnabled)}
                          className={isEnabled ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        >
                          {isToggling ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
                          {isEnabled ? "Enabled" : "Enable tool"}
                        </Button>
                      </div>

                      {tool.webhookKeys.length > 0 && (
                        <div className="pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 space-y-4 mt-2">
                          {tool.integrations.map(integration => {
                            const webhookKey = integration.key;
                            const isSaving = savingKey === webhookKey;
                            const isDeleting = deletingKey === webhookKey;
                            const hasUrl = Boolean(tool.urls[webhookKey]);

                            return (
                              <div key={webhookKey} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    {integration.label || webhookKey}
                                  </span>
                                  <span className="font-mono text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                                    {webhookKey}
                                  </span>
                                </div>
                                {integration.description && (
                                  <p className="text-xs text-zinc-500 max-w-3xl">
                                    {integration.description}
                                  </p>
                                )}
                                <div className="flex gap-2 max-w-3xl">
                                  <Input
                                    value={draftUrls[webhookKey] ?? ""}
                                    onChange={(e) =>
                                      setDraftUrls((prev) => ({
                                        ...prev,
                                        [webhookKey]: e.target.value,
                                      }))
                                    }
                                    placeholder="https://services.msgsndr.com/hooks/..."
                                    className="bg-white dark:bg-zinc-950 font-mono text-sm flex-1"
                                    disabled={isSaving || isDeleting}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                                    disabled={isSaving || isDeleting}
                                    onClick={() => handleSaveWebhook(webhookKey)}
                                  >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0"
                                    disabled={!hasUrl || isSaving || isDeleting}
                                    onClick={() => handleDeleteWebhook(webhookKey)}
                                  >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
