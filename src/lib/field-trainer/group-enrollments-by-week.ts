import { TimelineEnrollment } from "@/components/field-trainer-timeline/enrollment-card";
import { FIELD_TRAINER_WEEK_COLUMNS } from "./curriculum";

export function groupEnrollmentsByWeek(enrollments: TimelineEnrollment[]) {
  const grouped: Record<number, TimelineEnrollment[]> = {};
  for (const e of enrollments) {
    if (!grouped[e.currentWeek]) {
      grouped[e.currentWeek] = [];
    }
    grouped[e.currentWeek].push(e);
  }
  return grouped;
}

export function getEnrollmentSummaryStats(enrollments: TimelineEnrollment[]) {
  const activeCount = enrollments.filter((e) => e.programStatus === "active").length;
  const totalCount = enrollments.length;

  const grouped = groupEnrollmentsByWeek(enrollments);
  let busiestWeek = 0;
  let maxCount = 0;

  for (const col of FIELD_TRAINER_WEEK_COLUMNS) {
    const count = grouped[col.week]?.length || 0;
    if (count > maxCount) {
      maxCount = count;
      busiestWeek = col.week;
    }
  }

  const busiestWeekLabel = FIELD_TRAINER_WEEK_COLUMNS.find((c) => c.week === busiestWeek)?.title || "Week 0";

  return {
    totalCount,
    activeCount,
    busiestWeekLabel,
    maxCountInAWeek: maxCount,
  };
}
