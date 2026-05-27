"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ResourceNudgeList() {
  const stats = useQuery(api.resourceShares.getShareStatsForAgency);

  if (!stats || stats.nudgeList.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-500 font-medium">
        <Bell className="h-4 w-4" />
        <h3>Needs a Nudge</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.nudgeList.map((nudge) => (
          <div key={nudge.id} className="bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3 text-sm flex flex-col gap-1.5 shadow-sm">
            <div className="font-medium truncate" title={nudge.resourceTitle}>
              {nudge.resourceTitle}
            </div>
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="truncate" title={nudge.contactName || nudge.contactEmail}>
                {nudge.contactName || nudge.contactEmail}
              </span>
              <span className="text-xs flex items-center gap-1 whitespace-nowrap opacity-80">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(nudge.sharedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
