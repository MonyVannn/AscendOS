import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { DashboardMetrics } from "@/lib/dashboard-period";

interface DashboardMetricCardsProps {
  metrics: DashboardMetrics;
}

export function DashboardMetricCards({ metrics }: DashboardMetricCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active campaigns"
        value={metrics.formsTriggered.value.toString()}
        delta={metrics.formsTriggered.delta}
        deltaPct={metrics.formsTriggered.deltaPct}
      />
      <MetricCard
        title="Active agents"
        value={metrics.activeAgents.value.toString()}
        delta={metrics.activeAgents.delta}
        deltaPct={metrics.activeAgents.deltaPct}
      />
      <MetricCard
        title="Contacts reached"
        value={metrics.contactsReached.value.toString()}
        delta={metrics.contactsReached.delta}
        deltaPct={metrics.contactsReached.deltaPct}
      />
      <MetricCard
        title="Resources shared"
        value={metrics.resourcesShared.value.toString()}
        delta={metrics.resourcesShared.delta}
        deltaPct={metrics.resourcesShared.deltaPct}
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  delta,
  deltaPct,
  inverseGood = false,
}: {
  title: string;
  value: string | number;
  delta: number;
  deltaPct: number;
  inverseGood?: boolean;
}) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  const isGood = inverseGood ? !isPositive && !isNeutral : isPositive;

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-xs font-semibold text-muted-foreground uppercase">{title}</h3>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className="flex items-center text-xs font-medium mt-1">
          {isNeutral ? (
            <span className="text-muted-foreground flex items-center gap-1">
              <MinusIcon className="h-3.5 w-3.5" />
              No change vs prior
            </span>
          ) : (
            <span className={`flex items-center gap-1 ${isGood ? "text-emerald-600" : "text-red-600"}`}>
              {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
              {Math.abs(delta)} ({Math.abs(deltaPct)}%) <span className="text-muted-foreground font-normal ml-0.5">vs prior</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
