import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireSuperAdmin } from "./admin";

const keyRegex = /^[a-z0-9-]+$/;

export const listIntegrations = query({
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const integrations = await ctx.db.query("integrations").collect();
    return integrations.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const createIntegration = mutation({
  args: {
    key: v.string(),
    label: v.string(),
    description: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    if (!keyRegex.test(args.key)) {
      throw new Error("Key must contain only lowercase letters, numbers, and hyphens");
    }

    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      throw new Error(`Integration with key '${args.key}' already exists`);
    }

    return await ctx.db.insert("integrations", args);
  },
});

export const updateIntegration = mutation({
  args: {
    id: v.id("integrations"),
    label: v.string(),
    description: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});

export const listFeaturesAdmin = query({
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const features = await ctx.db.query("features").collect();
    const integrations = await ctx.db.query("integrations").collect();

    return features.map(feat => {
      const linkedIntegrations = (feat.integrationKeys || []).map(key => {
        const integration = integrations.find(i => i.key === key);
        return {
          key,
          label: integration?.label || key,
        };
      });

      return {
        ...feat,
        linkedIntegrations,
      };
    }).sort((a, b) => {
      if (a.pillar === b.pillar) {
        return a.sortOrder - b.sortOrder;
      }
      return a.pillar.localeCompare(b.pillar);
    });
  },
});

export const createFeature = mutation({
  args: {
    key: v.string(),
    label: v.string(),
    description: v.string(),
    pillar: v.union(
      v.literal("recruit"),
      v.literal("train"),
      v.literal("sell"),
      v.literal("team"),
      v.literal("account"),
      v.literal("tools")
    ),
    type: v.union(v.literal("smart-form"), v.literal("iframe"), v.literal("page")),
    href: v.string(),
    defaultEmbedUrl: v.optional(v.string()),
    icon: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
    integrationKeys: v.array(v.string()),
    toolName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    if (!keyRegex.test(args.key)) {
      throw new Error("Key must contain only lowercase letters, numbers, and hyphens");
    }

    const existing = await ctx.db
      .query("features")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      throw new Error(`Feature with key '${args.key}' already exists`);
    }

    // Validate integration keys
    for (const key of args.integrationKeys) {
      const integration = await ctx.db
        .query("integrations")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      if (!integration || !integration.isActive) {
        throw new Error(`Integration key '${key}' is invalid or inactive`);
      }
    }

    return await ctx.db.insert("features", args);
  },
});

export const updateFeature = mutation({
  args: {
    id: v.id("features"),
    label: v.string(),
    description: v.string(),
    pillar: v.union(
      v.literal("recruit"),
      v.literal("train"),
      v.literal("sell"),
      v.literal("team"),
      v.literal("account"),
      v.literal("tools")
    ),
    type: v.union(v.literal("smart-form"), v.literal("iframe"), v.literal("page")),
    href: v.string(),
    defaultEmbedUrl: v.optional(v.string()),
    icon: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
    integrationKeys: v.array(v.string()),
    toolName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const { id, ...patch } = args;

    // Validate integration keys
    for (const key of args.integrationKeys) {
      const integration = await ctx.db
        .query("integrations")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      if (!integration || !integration.isActive) {
        throw new Error(`Integration key '${key}' is invalid or inactive`);
      }
    }

    await ctx.db.patch(id, patch);
  },
});
