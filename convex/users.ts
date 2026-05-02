import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertFromClerk = internalMutation({
  args: {
    data: v.object({
      id: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const email = args.data.email;
    const clerkId = args.data.id;
    const name = args.data.name;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email,
        name,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("users", {
        clerkId,
        email,
        name,
        role: "RD",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    data: v.object({
      id: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const clerkId = args.data.id;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.delete(existingUser._id);
    }
  },
});
