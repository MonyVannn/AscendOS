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
    
    // We fetch all users and webhook logs once, then reduce in memory
    // to avoid O(N) queries for metrics, assuming admin-level scale.
    const allUsers = await ctx.db.query("users").collect();
    const allWebhookLogs = await ctx.db.query("webhookLogs").collect();

    // Omit sensitive data and add metrics
    return agencies.map(a => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ghlAccessToken, ghlApiKey, ghlWebhookUrl, ...safeAgency } = a;
      
      const rdCount = allUsers.filter(u => u.agencyId === a._id && u.role === "RD").length;
      const featureCount = a.featuresArray ? a.featuresArray.length : 0;
      const webhookCount = allWebhookLogs.filter(w => w.agencyId === a._id).length;
      
      // Derived status: onboarding until at least one RD is assigned
      const status: "ACTIVE" | "ONBOARDING" =
        rdCount >= 1 ? "ACTIVE" : "ONBOARDING";

      return {
        ...safeAgency,
        rdCount,
        featureCount,
        webhookCount,
        status,
      };
    });
  },
});

export const checkSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const existing = await ctx.db
      .query("agencies")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return !existing;
  }
});

export const createAgency = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    ghlLocationId: v.string(),
    ghlWebhookUrl: v.optional(v.string()),
    ghlAccessToken: v.string(),
    featuresArray: v.array(v.string()),
    theme: v.optional(v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
      backgroundColor: v.string(),
      sidebarColor: v.string(),
      textColor: v.string(),
      logoUrl: v.optional(v.string()),
      faviconUrl: v.optional(v.string()),
      fontFamily: v.string(),
      borderRadius: v.string(),
      dashboardTitle: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("agencies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("Agency slug already exists");
    }

    const agencyId = await ctx.db.insert("agencies", {
      name: args.name,
      slug: args.slug,
      ghlLocationId: args.ghlLocationId,
      ghlWebhookUrl: args.ghlWebhookUrl,
      ghlAccessToken: args.ghlAccessToken,
      featuresArray: args.featuresArray,
      createdAt: Date.now(),
    });

    if (args.theme) {
      await ctx.db.insert("agencyThemes", {
        agencyId,
        ...args.theme,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("agencyThemes", {
        agencyId,
        primaryColor: "#0075de",
        accentColor: "#097fe8",
        backgroundColor: "#f6f5f4",
        sidebarColor: "#1F1E1C",
        textColor: "#111827", // sensible default not in form
        logoUrl: undefined,
        faviconUrl: undefined,
        fontFamily: "Inter",
        borderRadius: "8px",
        dashboardTitle: args.name,
        updatedAt: Date.now(),
      });
    }

    return agencyId;
  }
});
