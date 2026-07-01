import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { applyWeekChange, MS_PER_WEEK } from "./lib/fieldTrainerWeek";

export const testScenario = internalMutation({
  args: { step: v.number() },
  handler: async (ctx, args) => {
    const agencies = await ctx.db.query("agencies").collect();
    if (agencies.length === 0) return { error: "No agencies" };
    const agencyId = agencies[0]._id;

    const users = await ctx.db.query("users").filter(q => q.eq(q.field("agencyId"), agencyId)).collect();
    if (users.length === 0) return { error: "No users" };
    const userId = users[0]._id;

    const now = Date.now();

    if (args.step === 1) {
      // 1. Enroll agent
      await ctx.db.insert("fieldTrainerEnrollments", {
        agencyId,
        phone: "1234567890",
        firstName: "Test Agent",
        programStatus: "active",
        startWeek: 0,
        currentWeek: 0,
        fieldTrainer: "Jon",
        assignedRdUserId: userId,
        programStartedAt: now,
        weekEffectiveAt: now - 8 * 24 * 60 * 60 * 1000, // 8 days ago
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, message: "Enrolled agent 8 days ago" };
    }
  }
});
