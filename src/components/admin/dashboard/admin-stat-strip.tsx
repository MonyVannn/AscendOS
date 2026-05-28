import * as React from "react";
import { Separator } from "@/components/ui/separator";

interface AdminStatStripProps {
  counts: {
    totalAgencies: number;
    activeAgencies: number;
    onboardingAgencies: number;
    provisionedUsers: number;
    unprovisionedUsers: number;
    platformAdmins: number;
  };
  webhook24h: {
    total: number;
    failed: number;
    successRate: number;
  };
}

export function AdminStatStrip({ counts, webhook24h }: AdminStatStripProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
      
      {/* Agencies */}
      <div className="min-w-0 flex-1 p-6">
        <div className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
          {counts.totalAgencies}
        </div>
        <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1">
          Agencies
        </div>
        <div className="text-xs text-zinc-400 mt-2 font-medium">
          <span className="text-zinc-600 dark:text-zinc-300">{counts.activeAgencies}</span> active · <span className="text-zinc-600 dark:text-zinc-300">{counts.onboardingAgencies}</span> onboarding
        </div>
      </div>

      <Separator className="md:hidden" />
      <Separator orientation="vertical" className="hidden md:block h-auto" />

      {/* Provisioned Users */}
      <div className="min-w-0 flex-1 p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
          {counts.provisionedUsers}
        </div>
        <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1">
          Provisioned Users
        </div>
        <div className="text-xs text-zinc-400 mt-2 font-medium">
          Across all active tenants
        </div>
      </div>

      <Separator className="md:hidden" />
      <Separator orientation="vertical" className="hidden md:block h-auto" />

      {/* Awaiting Assignment */}
      <div className="min-w-0 flex-1 p-6">
        <div className={`text-3xl font-bold ${counts.unprovisionedUsers > 0 ? "text-amber-600 dark:text-amber-500" : "text-zinc-950 dark:text-zinc-50"}`}>
          {counts.unprovisionedUsers}
        </div>
        <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1">
          Awaiting Assignment
        </div>
        <div className="text-xs text-zinc-400 mt-2 font-medium">
          <span className="text-zinc-600 dark:text-zinc-300">{counts.platformAdmins}</span> platform admins
        </div>
      </div>

      <Separator className="md:hidden" />
      <Separator orientation="vertical" className="hidden md:block h-auto" />

      {/* Webhooks 24h */}
      <div className="min-w-0 flex-1 p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className={`text-3xl font-bold ${webhook24h.successRate < 90 ? "text-red-600 dark:text-red-500" : "text-zinc-950 dark:text-zinc-50"}`}>
          {webhook24h.successRate}%
        </div>
        <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1">
          Webhook Success (24h)
        </div>
        <div className="text-xs text-zinc-400 mt-2 font-medium">
          <span className="text-zinc-600 dark:text-zinc-300">{webhook24h.total.toLocaleString()}</span> volume · <span className="text-zinc-600 dark:text-zinc-300">{webhook24h.failed.toLocaleString()}</span> failed
        </div>
      </div>
    </div>
  );
}