import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

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
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(v.literal("all"), v.literal("sent"), v.literal("failed"))),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], continueCursor: "", isDone: true };

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || !caller.agencyId) return { page: [], continueCursor: "", isDone: true };

    const hasSearch = args.search && args.search.trim().length > 0;
    const searchQuery = hasSearch ? args.search!.trim().toLowerCase() : "";

    let isDone = false;
    let continueCursor = args.paginationOpts.cursor;
    const page = [];
    const targetCount = args.paginationOpts.numItems;

    // We loop to accumulate enough matches if there's a search term.
    // If no search term, we just do one pagination call.
    while (page.length < targetCount && !isDone) {
      const batchSize = hasSearch ? 50 : targetCount - page.length;
      
      let q = ctx.db
        .query("webhookLogs")
        .withIndex("by_agency_submitted", (q) => {
          const indexQuery = q.eq("agencyId", caller.agencyId!);
          if (args.dateTo !== undefined) {
            return indexQuery.lte("submittedAt", args.dateTo);
          }
          return indexQuery;
        })
        .order("desc");

      if (args.dateFrom !== undefined) {
        q = q.filter((q) => q.gte(q.field("submittedAt"), args.dateFrom!));
      }

      if (args.status === "sent") {
        q = q.filter((q) => q.eq(q.field("success"), true));
      } else if (args.status === "failed") {
        q = q.filter((q) => q.eq(q.field("success"), false));
      }

      const result = await q.paginate({ cursor: continueCursor, numItems: batchSize });
      
      for (const log of result.page) {
        let matches = true;
        if (hasSearch) {
          const matchName = log.contactName?.toLowerCase().includes(searchQuery) ?? false;
          const matchEmail = log.contactEmail?.toLowerCase().includes(searchQuery) ?? false;
          matches = matchName || matchEmail;
        }
        
        if (matches) {
          page.push({
            _id: log._id,
            submittedAt: log.submittedAt,
            contactName: log.contactName,
            contactEmail: log.contactEmail,
            templateName: log.templateName,
            toolName: log.toolName,
            success: log.success,
          });
        }
      }

      continueCursor = result.continueCursor;
      isDone = result.isDone;

      if (!hasSearch) {
        break;
      }
    }

    return {
      page,
      continueCursor,
      isDone,
    };
  },
});
