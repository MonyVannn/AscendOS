import { mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  fieldTrainerNameValidator,
  fieldTrainerEventTypeValidator,
  FIELD_TRAINER_MAX_WEEK,
} from "./fieldTrainerValidators";

export const applyEnrollmentFromSubmission = mutation({
  args: {
    agencyId: v.id("agencies"),
    userId: v.id("users"),
    phone: v.string(),
    firstName: v.string(),
    eventType: fieldTrainerEventTypeValidator,
    fieldTrainer: v.optional(fieldTrainerNameValidator),
    week: v.optional(v.number()),
    webhookLogId: v.optional(v.id("webhookLogs")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller) throw new Error("User not found");
    if (caller._id !== args.userId) throw new Error("Unauthorized: userId mismatch");
    if (caller.agencyId !== args.agencyId) throw new Error("Unauthorized: agencyId mismatch");

    // 2. Normalize phone
    const normalizedPhone = args.phone.replace(/\D/g, "");

    // 3. Upsert enrollment by (agencyId, phone)
    let enrollment = await ctx.db
      .query("fieldTrainerEnrollments")
      .withIndex("by_agency_and_phone", (q) => 
        q.eq("agencyId", args.agencyId).eq("phone", normalizedPhone)
      )
      .first();

    const now = Date.now();

    if (!enrollment) {
      if (args.eventType !== "started_production_drip") {
        // Technically they should start before reassigning/repositioning, but let's allow upsert
        // We need a fieldTrainer for the new row.
        if (!args.fieldTrainer) {
          throw new Error("fieldTrainer is required for new enrollments");
        }
        const enrollmentId = await ctx.db.insert("fieldTrainerEnrollments", {
          agencyId: args.agencyId,
          phone: normalizedPhone,
          firstName: args.firstName,
          programStatus: "active",
          startWeek: args.week ?? 0,
          currentWeek: args.week ?? 0,
          fieldTrainer: args.fieldTrainer,
          assignedRdUserId: args.userId,
          programStartedAt: now,
          createdAt: now,
          updatedAt: now,
        });
        enrollment = await ctx.db.get(enrollmentId);
      } else {
        if (!args.fieldTrainer) {
          throw new Error("fieldTrainer is required when starting production drip");
        }
        const enrollmentId = await ctx.db.insert("fieldTrainerEnrollments", {
          agencyId: args.agencyId,
          phone: normalizedPhone,
          firstName: args.firstName,
          programStatus: "active",
          startWeek: 0,
          currentWeek: 0,
          fieldTrainer: args.fieldTrainer,
          assignedRdUserId: args.userId,
          programStartedAt: now,
          createdAt: now,
          updatedAt: now,
        });
        enrollment = await ctx.db.get(enrollmentId);
      }
    } else {
      // Update existing enrollment
      const updates: any = {
        firstName: args.firstName,
        updatedAt: now,
      };

      if (args.eventType === "started_production_drip") {
        if (args.fieldTrainer) updates.fieldTrainer = args.fieldTrainer;
        updates.assignedRdUserId = args.userId;
        // Optionally update currentWeek or programStatus here, but usually it restarts or continues
        updates.programStatus = "active";
      } else if (args.eventType === "reassigned_trainer") {
        if (args.fieldTrainer) updates.fieldTrainer = args.fieldTrainer;
        updates.assignedRdUserId = args.userId;
      } else if (args.eventType === "repositioned_week") {
        if (args.week !== undefined) {
          updates.currentWeek = args.week;
          if (args.week >= FIELD_TRAINER_MAX_WEEK) {
            updates.programStatus = "completed";
          } else {
            updates.programStatus = "active";
          }
        }
        updates.weekEffectiveAt = now;
        updates.assignedRdUserId = args.userId;
      }

      await ctx.db.patch(enrollment!._id, updates);
      enrollment = await ctx.db.get(enrollment!._id);
    }

    // 5. Insert fieldTrainerEvents row
    const eventId = await ctx.db.insert("fieldTrainerEvents", {
      agencyId: args.agencyId,
      enrollmentId: enrollment!._id,
      eventType: args.eventType,
      performedByUserId: args.userId,
      week: args.week,
      fieldTrainer: args.fieldTrainer,
      webhookLogId: args.webhookLogId,
      occurredAt: now,
    });

    return { enrollmentId: enrollment!._id, eventId };
  },
});
