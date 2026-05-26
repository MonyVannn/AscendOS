"use client";

import { FIELD_TRAINER_WEEK_COLUMNS } from "@/lib/field-trainer/curriculum";
import { TimelineColumn } from "./timeline-column";
import { TimelineEnrollment } from "./enrollment-card";
import { useMemo } from "react";

interface TimelineBoardProps {
  enrollments: TimelineEnrollment[];
}

export function TimelineBoard({ enrollments }: TimelineBoardProps) {
  // Group enrollments by week
  const enrollmentsByWeek = useMemo(() => {
    const grouped: Record<number, TimelineEnrollment[]> = {};
    for (const e of enrollments) {
      if (!grouped[e.currentWeek]) {
        grouped[e.currentWeek] = [];
      }
      grouped[e.currentWeek].push(e);
    }
    return grouped;
  }, [enrollments]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full snap-x snap-mandatory">
      {FIELD_TRAINER_WEEK_COLUMNS.map((col) => (
        <div key={col.week} className="snap-start h-full">
          <TimelineColumn 
            column={col} 
            enrollments={enrollmentsByWeek[col.week] || []} 
          />
        </div>
      ))}
    </div>
  );
}
