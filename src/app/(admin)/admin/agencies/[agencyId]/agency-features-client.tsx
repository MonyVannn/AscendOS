"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FEATURE_TO_WEBHOOK_KEY } from "@/lib/feature-tool-mapping";

export function AgencyFeaturesClient({ agencyId }: { agencyId: string }) {
  const { isAuthenticated } = useConvexAuth();
  const agencyIdTyped = agencyId as Id<"agencies">;

  const data = useQuery(
    api.admin.listAgencyFeatures,
    isAuthenticated ? { agencyId: agencyIdTyped } : "skip"
  );
  
  const toggleFeature = useMutation(api.admin.toggleAgencyFeature);

  const [togglingKey, setTogglingKey] = React.useState<string | null>(null);

  if (data === undefined) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  const featuresByPillar = data.features.reduce((acc, feat) => {
    if (!acc[feat.pillar]) acc[feat.pillar] = [];
    acc[feat.pillar].push(feat);
    return acc;
  }, {} as Record<string, typeof data.features>);

  const pillars = ["recruit", "train", "sell", "team", "account", "tools"];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
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
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">Agency Features</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Features control what appears in the RD dashboard sidebar. Integrations control GHL webhooks. Both must be enabled for a tool to be fully live.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {pillars.map((pillar) => {
          const features = featuresByPillar[pillar];
          if (!features || features.length === 0) return null;

          return (
            <div key={pillar}>
              <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  {pillar}
                </h3>
              </div>
              
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {features.map((feat) => {
                  const isToggling = togglingKey === feat.key;
                  const isEnabled = feat.isEnabled;
                  const webhookKey = FEATURE_TO_WEBHOOK_KEY[feat.key];

                  return (
                    <div
                      key={feat.key}
                      className={`flex items-center justify-between gap-4 px-6 py-4 ${
                        !isEnabled ? "opacity-75 bg-zinc-50/50 dark:bg-zinc-900/50" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                          {feat.label}
                          {webhookKey && (
                            <Badge variant="outline" className="text-[10px] font-mono bg-blue-50 text-blue-700 border-blue-200">
                              Requires: {webhookKey}
                            </Badge>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded w-max">
                          {feat.key}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant={isEnabled ? "default" : "secondary"}
                        size="sm"
                        disabled={isToggling}
                        onClick={async () => {
                          setTogglingKey(feat.key);
                          try {
                            await toggleFeature({
                              agencyId: agencyIdTyped,
                              featureKey: feat.key,
                              isEnabled: !isEnabled,
                            });
                          } catch (err: unknown) {
                            console.error(err);
                          } finally {
                            setTogglingKey(null);
                          }
                        }}
                        className={isEnabled ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                      >
                        {isToggling ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Button>
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
