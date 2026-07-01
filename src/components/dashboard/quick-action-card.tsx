"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { iconMap } from "@/lib/dashboard-icons";
import { formatRelativeTime } from "@/lib/dashboard-period";
import { LiveIndicator } from "@/components/ui/live-indicator";
import type { QuickActionItem } from "@/components/dashboard/dashboard-quick-actions";

interface QuickActionCardProps {
  action: QuickActionItem;
  nowMs: number;
}

export function QuickActionCard({ action, nowMs }: QuickActionCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const Icon = iconMap[action.icon] || iconMap.zap;
  const href = action.isImplemented ? action.href : "#";

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all ${
        action.isImplemented ? "hover:border-accent/30 hover:shadow-md" : "opacity-75 cursor-default"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            action.isImplemented ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {action.isLive ? (
          <LiveIndicator active={isHovered} />
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
          {!action.isImplemented && (
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-normal text-muted-foreground uppercase tracking-wider">
              Coming soon
            </span>
          )}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2">Trigger this automation from the hub.</p>
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
              {action.thisWeekCount}{" "}
              <span className="text-xs text-muted-foreground font-normal">/ {action.allTimeCount} all-time</span>
            </p>
          </div>
        </div>
        {action.isImplemented && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </Link>
  );
}
