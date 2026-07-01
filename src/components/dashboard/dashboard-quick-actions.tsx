import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";

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
        <Link href="/dashboard/activity-log" className="group flex items-center text-sm font-medium text-accent hover:text-accent/80 hover:underline">
          View all forms
          <IconArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
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

