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
    const allAgencyFeatures = await ctx.db.query("agencyFeatures").collect();
    const allFeatures = await ctx.db.query("features").collect();

    // Omit sensitive data and add metrics
    return agencies.map(a => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ghlAccessToken, ghlApiKey, ghlWebhookUrl, ...safeAgency } = a;
      
      const rdCount = allUsers.filter(u => u.agencyId === a._id && u.role === "RD").length;
      const agencyFeatureJoins = allAgencyFeatures.filter(af => af.agencyId === a._id && af.isEnabled);
      const webhookCount = allWebhookLogs.filter(w => w.agencyId === a._id).length;
      
      const enabledFeatures = agencyFeatureJoins
        .map(af => {
          const feature = allFeatures.find(f => f._id === af.featureId);
          if (!feature || !feature.isActive) return null;
          return {
            key: feature.key,
            label: af.customLabel || feature.label,
          };
        })
        .filter(Boolean) as { key: string; label: string }[];
      
      // Derived status: onboarding until at least one RD is assigned
      const status: "ACTIVE" | "ONBOARDING" =
        rdCount >= 1 ? "ACTIVE" : "ONBOARDING";

      return {
        ...safeAgency,
        rdCount,
        featureCount: enabledFeatures.length,
        webhookCount,
        status,
        enabledFeatures,
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
    featureKeys: v.array(v.string()),
    theme: v.optional(v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
      backgroundColor: v.string(),
      sidebarColor: v.string(),
      textColor: v.string(),
      
      sidebarBg: v.optional(v.string()),
      sidebarItemText: v.optional(v.string()),
      sidebarSectionLabel: v.optional(v.string()),
      sidebarHoverBg: v.optional(v.string()),
      sidebarActiveItemBg: v.optional(v.string()),

      pageBg: v.optional(v.string()),
      cardBg: v.optional(v.string()),
      cardInnerBg: v.optional(v.string()),
      borderColor: v.optional(v.string()),

      headingText: v.optional(v.string()),
      bodyText: v.optional(v.string()),
      mutedText: v.optional(v.string()),

      primaryForeground: v.optional(v.string()),

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

    const allFeatures = await ctx.db.query("features").collect();
    const validFeatures = [];
    for (const key of args.featureKeys) {
      const feat = allFeatures.find(f => f.key === key);
      if (!feat) throw new Error(`Unknown feature key: ${key}`);
      validFeatures.push({ id: feat._id, sortOrder: feat.sortOrder });
    }

    const agencyId = await ctx.db.insert("agencies", {
      name: args.name,
      slug: args.slug,
      ghlLocationId: args.ghlLocationId,
      ghlWebhookUrl: args.ghlWebhookUrl,
      ghlAccessToken: args.ghlAccessToken,
      createdAt: Date.now(),
    });

    for (const feat of validFeatures) {
      await ctx.db.insert("agencyFeatures", {
        agencyId,
        featureId: feat.id,
        isEnabled: true,
        sortOrder: feat.sortOrder,
      });
    }

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
        
        sidebarBg: "#1F1E1C",
        sidebarItemText: "#a1a1aa",
        sidebarSectionLabel: "#71717a",
        sidebarHoverBg: "rgba(255, 255, 255, 0.05)",
        sidebarActiveItemBg: "rgba(255, 255, 255, 0.1)",
        
        pageBg: "#f6f5f4",
        cardBg: "#ffffff",
        cardInnerBg: "#f4f4f5",
        borderColor: "#e4e4e7",
        
        headingText: "#111827",
        bodyText: "#111827",
        mutedText: "#71717a",

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
