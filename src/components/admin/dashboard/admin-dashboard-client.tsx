"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

import { AdminDashboardHeader } from "./admin-dashboard-header";
import { AdminStatStrip } from "./admin-stat-strip";
import { AdminAttentionPanel } from "./admin-attention-panel";
import { AdminQuickActions } from "./admin-quick-actions";
import { AdminPlatformActivity } from "./admin-platform-activity";
import { AdminAgencySnapshot } from "./admin-agency-snapshot";
import { AdminDashboardSkeleton } from "./admin-dashboard-skeleton";

export function AdminDashboardClient() {
  const { isAuthenticated } = useConvexAuth();
  const summary = useQuery(api.admin.getDashboardSummary, isAuthenticated ? undefined : "skip");

  if (summary === undefined) {
    return <AdminDashboardSkeleton />;
  }

  const nowMs = Date.now();

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col pb-6">
      <AdminDashboardHeader health={summary.systemHealth} date={summary.generatedAt} />
      
      <div className="mt-6">
        <AdminStatStrip counts={summary.counts} webhook24h={summary.webhook24h} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AdminAttentionPanel items={summary.attentionItems} />
        <AdminQuickActions unprovisionedCount={summary.counts.unprovisionedUsers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-6">
        <AdminPlatformActivity logs={summary.recentActivity} nowMs={nowMs} />
        <AdminAgencySnapshot agencies={summary.agencySnapshot} />
      </div>
    </div>
  );
}