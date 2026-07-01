import { FIELD_TRAINER_MAX_WEEK } from "../fieldTrainerValidators";

export const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

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

export function applyWeekChange(
  targetWeek: number,
  nowMs: number
) {
  const safeTargetWeek = Math.max(0, Math.min(FIELD_TRAINER_MAX_WEEK, targetWeek));
  
  return {
    currentWeek: safeTargetWeek,
    weekEffectiveAt: nowMs,
    programStatus: safeTargetWeek >= FIELD_TRAINER_MAX_WEEK ? "completed" as const : "active" as const,
    updatedAt: nowMs,
  };
}

export function getMissedAutoAdvances(
  enrollment: {
    currentWeek: number;
    weekEffectiveAt?: number;
    programStartedAt: number;
  },
  nowMs: number
) {
  const anchor = enrollment.weekEffectiveAt ?? enrollment.programStartedAt;
  const weeksElapsed = Math.floor(Math.max(0, nowMs - anchor) / MS_PER_WEEK);
  
  const advances = [];
  for (let i = 1; i <= weeksElapsed; i++) {
    const reachedWeek = enrollment.currentWeek + i;
    if (reachedWeek > FIELD_TRAINER_MAX_WEEK) break;
    
    advances.push({
      week: reachedWeek,
      occurredAt: anchor + i * MS_PER_WEEK,
    });
  }
  
  return advances;
}
