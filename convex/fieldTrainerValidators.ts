import { v } from "convex/values";

// Keep in sync with src/lib/ghl/field-trainer-options.ts
export const fieldTrainerNameValidator = v.union(
  v.literal("Jon"),
  v.literal("Paz"),
  v.literal("Troy"),
  v.literal("Zach"),
  v.literal("Austin")
);

export const fieldTrainerEventTypeValidator = v.union(
  v.literal("started_production_drip"),
  v.literal("reassigned_trainer"),
  v.literal("repositioned_week"),
  v.literal("agent_removed"),
  v.literal("auto_advanced_week")
);

export const FIELD_TRAINER_MAX_WEEK = 5;
