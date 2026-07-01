"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { FIELD_TRAINER_WEEK_COLUMNS } from "@/lib/field-trainer/curriculum";
import { groupEnrollmentsByWeek, getEnrollmentSummaryStats } from "@/lib/field-trainer/group-enrollments-by-week";
import { TimelineEnrollment } from "@/components/field-trainer-timeline/enrollment-card";

import { computeEffectiveWeek } from "@/lib/field-trainer/compute-effective-week";
import * as React from "react";

export function DashboardFieldTrainerTimelinePreview() {
  const { isAuthenticated } = useConvexAuth();
  const rawEnrollments = useQuery(api.fieldTrainer.listForTimeline, isAuthenticated ? {} : "skip");

  const [nowMs, setNowMs] = React.useState(() => Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const enrollments = React.useMemo(() => {
    if (!rawEnrollments) return undefined;
    return rawEnrollments.map(e => ({
      ...e,
      currentWeek: computeEffectiveWeek(e, nowMs)
    }));
  }, [rawEnrollments, nowMs]);

  const isLoading = enrollments === undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Field Trainer Timeline</h3>
        <Link href="/dashboard/field-trainer-timeline" className="group flex items-center text-sm font-medium text-accent hover:text-accent/80 hover:underline">
          View timeline
          <IconArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      <Link 
        href="/dashboard/field-trainer-timeline"
        className="group block rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
      >
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex gap-8">
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-32" />
            </div>
            <div className="flex gap-2 h-24">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 h-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <PreviewContent enrollments={enrollments as TimelineEnrollment[]} />
        )}
      </Link>
    </div>
  );
}

function PreviewContent({ enrollments }: { enrollments: TimelineEnrollment[] }) {
  const stats = getEnrollmentSummaryStats(enrollments);
  const grouped = groupEnrollmentsByWeek(enrollments);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <div>
          <div className="text-2xl font-bold text-foreground">{stats.totalCount}</div>
          <div className="text-xs text-muted-foreground">Total in program</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{stats.activeCount}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
      </div>

      {/* Mini Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mb-2">
        {FIELD_TRAINER_WEEK_COLUMNS.map((col) => {
          const weekEnrollments = grouped[col.week] || [];
          const count = weekEnrollments.length;
          
          return (
            <div key={col.week} className="flex-1 min-w-[80px] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs border-b border-border/50 pb-1">
                <span className="font-semibold text-foreground">W{col.week}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              
              <div className="h-24 flex items-end">
                {count > 0 ? (
                  <div className="flex flex-col-reverse flex-wrap gap-1 max-h-full content-start">
                    {Array.from({ length: count }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-3.5 h-3.5 rounded-[3px] bg-accent/80 shadow-sm"
                        title={`Agent ${i + 1}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-end pb-1">
                    <span className="text-[10px] text-muted-foreground/50 italic">Empty</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {enrollments.length === 0 && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground italic">No agents in the field trainer program yet</p>
        </div>
      )}
    </div>
  );
}
