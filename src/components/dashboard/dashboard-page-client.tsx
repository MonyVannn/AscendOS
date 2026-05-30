"use client";

import * as React from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TenantContext } from "@/lib/tenant";
import { getPeriodRange, DashboardPeriod } from "@/lib/dashboard-period";
import { DashboardGreetingHeader } from "./dashboard-greeting-header";
import { DashboardSetupBanner } from "./dashboard-setup-banner";
import { DashboardMetricCards } from "./dashboard-metric-cards";
import { DashboardQuickActions } from "./dashboard-quick-actions";
import { DashboardRecentActivity } from "./dashboard-recent-activity";
import { DashboardScheduledDrips } from "./dashboard-scheduled-drips";
import { DashboardSkeleton } from "./dashboard-skeleton";

interface DashboardPageClientProps {
  tenant: NonNullable<TenantContext>;
}

export function DashboardPageClient({ tenant }: DashboardPageClientProps) {
  const { isAuthenticated } = useConvexAuth();
  const [period, setPeriod] = React.useState<DashboardPeriod>("this_week");
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const periodRange = React.useMemo(() => getPeriodRange(period), [period]);

  const summary = useQuery(api.dashboard.getSummary, isAuthenticated ? {
    periodStartMs: periodRange.current.startMs,
    periodEndMs: periodRange.current.endMs,
    priorStartMs: periodRange.prior.startMs,
    priorEndMs: periodRange.prior.endMs,
  } : "skip");

  if (!summary) {
    return <DashboardSkeleton />;
  }

  const smartForms = summary.quickActions
    .filter(a => a.isImplemented)
    .map(a => ({ label: a.label, href: a.href, isLive: a.isLive }));

  return (
    <div className="mx-auto max-w-screen-2xl py-6 px-4 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <DashboardGreetingHeader
        userName={tenant.user.name || "User"}
        formsReadyCount={summary.formsReadyCount}
        periodLabel={periodRange.label}
        period={period}
        onPeriodChange={setPeriod}
        metrics={{
          formsTriggered: summary.metrics.formsTriggered.value,
          activeAgents: summary.metrics.activeAgents.value,
          contactsReached: summary.metrics.contactsReached.value
        }}
        smartForms={smartForms}
      />

      <DashboardSetupBanner 
        profileComplete={summary.profileComplete} 
        ghlConnected={summary.ghlConnected} 
      />

      <DashboardMetricCards metrics={summary.metrics} />

      <DashboardQuickActions actions={summary.quickActions} nowMs={nowMs} />

      <div className="grid gap-6 lg:grid-cols-3 h-[450px]">
        <div className="lg:col-span-2 h-full">
          <DashboardRecentActivity 
            logs={summary.recentActivity} 
            currentUserId={tenant.user._id} 
            nowMs={nowMs} 
          />
        </div>
        <div className="h-full">
          <DashboardScheduledDrips />
        </div>
      </div>
    </div>
  );
}
