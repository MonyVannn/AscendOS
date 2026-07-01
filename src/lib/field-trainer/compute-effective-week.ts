export const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
export const FIELD_TRAINER_MAX_WEEK = 5;

export function computeEffectiveWeek(
  enrollment: {
    currentWeek: number;
    weekEffectiveAt?: number;
    programStartedAt: number;
  },
  nowMs: number
): number {
  const anchor = enrollment.weekEffectiveAt ?? enrollment.programStartedAt;
  const weeksElapsed = Math.floor(Math.max(0, nowMs - anchor) / MS_PER_WEEK);
  return Math.min(FIELD_TRAINER_MAX_WEEK, enrollment.currentWeek + weeksElapsed);
}
