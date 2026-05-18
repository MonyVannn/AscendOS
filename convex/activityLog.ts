import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const recordSubmission = mutation({
  args: {
    agencyId: v.id("agencies"),
    userId: v.id("users"),
    toolName: v.string(),
    templateName: v.optional(v.string()),
    contactEmail: v.string(),
    contactName: v.optional(v.string()),
    ghlStatus: v.number(),
    success: v.boolean(),
    retried: v.boolean(),
    errorMessage: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
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

    const id = await ctx.db.insert("webhookLogs", {
      ...args,
      submittedAt: Date.now(),
    });

    return { id };
  },
});

export const listSubmissionLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || !caller.agencyId) return [];

    const limit = Math.min(args.limit ?? 50, 50);

    const logs = await ctx.db
      .query("webhookLogs")
      .withIndex("by_agency_user_submitted", (q) => 
        q.eq("agencyId", caller.agencyId!).eq("userId", caller._id)
      )
      .order("desc")
      .take(limit);

    return logs.map((log) => ({
      _id: log._id,
      submittedAt: log.submittedAt,
      contactName: log.contactName,
      contactEmail: log.contactEmail,
      templateName: log.templateName,
      toolName: log.toolName,
      success: log.success,
    }));
  },
});
