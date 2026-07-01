import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  fieldTrainerNameValidator,
  fieldTrainerEventTypeValidator,
} from "./fieldTrainerValidators";
import { applyWeekChange, computeEffectiveWeek, getMissedAutoAdvances } from "./lib/fieldTrainerWeek";

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
          weekEffectiveAt: now,
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
          weekEffectiveAt: now,
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
          const patch = applyWeekChange(args.week, now);
          Object.assign(updates, patch);
        }
        updates.assignedRdUserId = args.userId;
      } else if (args.eventType === "agent_removed") {
        updates.programStatus = "withdrawn";
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

export const listForTimeline = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || !caller.agencyId) return [];

    const enrollments = await ctx.db
      .query("fieldTrainerEnrollments")
      .withIndex("by_agency", (q) => q.eq("agencyId", caller.agencyId!))
      .collect();

    const activeEnrollments = enrollments.filter(e => e.programStatus !== "withdrawn");

    const result = [];
    for (const e of activeEnrollments) {
      const rd = await ctx.db.get(e.assignedRdUserId);
      
      result.push({
        _id: e._id,
        firstName: e.firstName,
        phone: e.phone,
        currentWeek: e.currentWeek,
        fieldTrainer: e.fieldTrainer,
        programStatus: e.programStatus,
        programStartedAt: e.programStartedAt,
        weekEffectiveAt: e.weekEffectiveAt,
        assignedRdName: rd?.name || rd?.email || "Unknown",
      });
    }

    return result;
  },
});

export const getEnrollmentDetail = query({
  args: {
    enrollmentId: v.id("fieldTrainerEnrollments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || !caller.agencyId) return null;

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment || enrollment.agencyId !== caller.agencyId) return null;

    const rd = await ctx.db.get(enrollment.assignedRdUserId);

    const events = await ctx.db
      .query("fieldTrainerEvents")
      .withIndex("by_enrollment", (q) => q.eq("enrollmentId", args.enrollmentId))
      .order("desc")
      .collect();

    const eventsWithUsers = [];
    for (const event of events) {
      const user = event.performedByUserId ? await ctx.db.get(event.performedByUserId) : null;
      eventsWithUsers.push({
        _id: event._id,
        eventType: event.eventType,
        occurredAt: event.occurredAt,
        week: event.week,
        fieldTrainer: event.fieldTrainer,
        performedByName: user?.name || user?.email || (event.eventType === "auto_advanced_week" ? "System" : "Unknown"),
      });
    }

    return {
      _id: enrollment._id,
      firstName: enrollment.firstName,
      phone: enrollment.phone,
      programStatus: enrollment.programStatus,
      startWeek: enrollment.startWeek,
      currentWeek: enrollment.currentWeek,
      fieldTrainer: enrollment.fieldTrainer,
      programStartedAt: enrollment.programStartedAt,
      weekEffectiveAt: enrollment.weekEffectiveAt,
      ghlContactId: enrollment.ghlContactId,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      assignedRd: {
        name: rd?.name || "Unknown",
        email: rd?.email || "Unknown",
      },
      events: eventsWithUsers,
    };
  },
});

export const setEnrollmentWeek = mutation({
  args: {
    enrollmentId: v.id("fieldTrainerEnrollments"),
    week: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || !caller.agencyId) throw new Error("Unauthorized");

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    if (enrollment.agencyId !== caller.agencyId) throw new Error("Unauthorized");
    if (enrollment.programStatus === "withdrawn") throw new Error("Agent is withdrawn");

    const now = Date.now();
    const patch = applyWeekChange(args.week, now);
    
    await ctx.db.patch(args.enrollmentId, patch);

    await ctx.db.insert("fieldTrainerEvents", {
      agencyId: enrollment.agencyId,
      enrollmentId: args.enrollmentId,
      eventType: "repositioned_week",
      performedByUserId: caller._id,
      week: patch.currentWeek,
      fieldTrainer: enrollment.fieldTrainer,
      occurredAt: now,
    });
  },
});

export const syncEnrollmentWeeks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const enrollments = await ctx.db
      .query("fieldTrainerEnrollments")
      .filter((q) => q.eq(q.field("programStatus"), "active"))
      .collect();

    const now = Date.now();
    let updatedCount = 0;

    for (const enrollment of enrollments) {
      const advances = getMissedAutoAdvances(enrollment, now);
      
      if (advances.length > 0) {
        const latestAdvance = advances[advances.length - 1];
        
        // We set the weekEffectiveAt to exactly when they reached the latest week
        const patch = applyWeekChange(latestAdvance.week, latestAdvance.occurredAt);
        patch.updatedAt = now; // Actually updated now
        
        await ctx.db.patch(enrollment._id, patch);

        for (const adv of advances) {
          await ctx.db.insert("fieldTrainerEvents", {
            agencyId: enrollment.agencyId,
            enrollmentId: enrollment._id,
            eventType: "auto_advanced_week",
            week: adv.week,
            fieldTrainer: enrollment.fieldTrainer,
            occurredAt: adv.occurredAt,
          });
        }

        updatedCount++;
      }
    }

    return { updatedCount };
  },
});
