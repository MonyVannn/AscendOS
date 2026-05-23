import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { iconMap } from "@/lib/dashboard-icons";
import { formatRelativeTime } from "@/lib/dashboard-period";

export type QuickActionItem = {
  featureKey: string;
  label: string;
  href: string;
  icon: string;
  isLive: boolean;
  isImplemented: boolean;
  thisWeekCount: number;
  allTimeCount: number;
  lastFiredAt?: number;
};

interface DashboardQuickActionsProps {
  actions: QuickActionItem[];
  nowMs: number;
}

export function DashboardQuickActions({ actions, nowMs }: DashboardQuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
        <Link href="/dashboard/activity-log" className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">
          View all forms →
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <QuickActionCard key={action.featureKey} action={action} nowMs={nowMs} />
        ))}
      </div>
    </div>
  );
}

function QuickActionCard({ action, nowMs }: { action: QuickActionItem; nowMs: number }) {
  const Icon = iconMap[action.icon] || iconMap.zap;
  const href = action.isImplemented ? action.href : "#";

  return (
    <Link 
      href={href}
      className={`group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all ${
        action.isImplemented ? "hover:border-red-200 hover:shadow-md" : "opacity-75 cursor-default"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.isLive ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
        {action.isLive ? (
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            Not configured
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          {action.label}
          {!action.isImplemented && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-normal text-muted-foreground uppercase tracking-wider">Coming soon</span>}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2">
          Trigger this automation from the hub.
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-end justify-between">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Fired</p>
            <p className="text-sm font-medium text-foreground">
              {action.lastFiredAt ? formatRelativeTime(action.lastFiredAt, nowMs) : "Never"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">This Week</p>
            <p className="text-sm font-medium text-foreground">
              {action.thisWeekCount} <span className="text-xs text-muted-foreground font-normal">/ {action.allTimeCount} all-time</span>
            </p>
          </div>
        </div>
        {action.isImplemented && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </Link>
  );
}
