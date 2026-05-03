import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const assignUserToAgency = mutation({
  args: {
    clerkId: v.string(),
    agencyId: v.id("agencies"),
    role: v.union(v.literal("RD"), v.literal("SUPER_ADMIN")),
  },
  handler: async (ctx, { clerkId, agencyId, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const target = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!target) throw new Error("User not found");

    await ctx.db.patch(target._id, { agencyId, role });

    return { success: true };
  },
});

export const listUnprovisionedUsers = query({
  args: {
    refreshNonce: v.optional(v.number()),
  },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("agencyId"), undefined),
          q.neq(q.field("role"), "SUPER_ADMIN")
        )
      )
      .collect();
  },
});

export const listAgencies = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const agencies = await ctx.db.query("agencies").collect();
    
    // Omit sensitive data
    return agencies.map(a => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ghlApiKey, ghlWebhookUrl, ...safeAgency } = a;
      return safeAgency;
    });
  },
});
