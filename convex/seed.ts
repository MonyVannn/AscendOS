import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { INITIAL_FEATURES } from "./featureRegistry";

/**
 * One-time: copies legacy `ghlApiKey` → `ghlAccessToken`, sets default `ghlLocationId`,
 * removes `ghlApiKey`. Run from project root:
 * `npx convex run seed:backfillAgencyGhlFields`
 */
export const backfillAgencyGhlFields = internalMutation({
  handler: async (ctx) => {
    const agencies = await ctx.db.query("agencies").collect();
    let patched = 0;
    for (const a of agencies) {
      const legacyKey = a.ghlApiKey;
      const patch: {
        ghlLocationId?: string;
        ghlAccessToken?: string;
        ghlApiKey?: undefined;
      } = {};

      if (a.ghlLocationId === undefined) {
        patch.ghlLocationId = "";
      }

      if (legacyKey !== undefined) {
        if (!a.ghlAccessToken?.trim()) {
          patch.ghlAccessToken = legacyKey;
        }
        patch.ghlApiKey = undefined;
      } else if (a.ghlAccessToken === undefined) {
        patch.ghlAccessToken = "";
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(a._id, patch);
        patched++;
      }
    }
    return { patched, total: agencies.length };
  },
});

export const bootstrapAgency = internalMutation({
  handler: async (ctx) => {
    // 1. Check if "Divinity Group" exists
    const existing = await ctx.db
      .query("agencies")
      .withIndex("by_slug", (q) => q.eq("slug", "divinity-group"))
      .unique();

    if (existing) {
      return "Agency already exists";
    }

    // 2. Create the agency
    const agencyId = await ctx.db.insert("agencies", {
      name: "Divinity Group",
      slug: "divinity-group",
      ghlLocationId: "",
      ghlWebhookUrl: "",
      ghlAccessToken: "",
      createdAt: Date.now(),
    });

    const activeFeatures = await ctx.db.query("features").filter(q => q.eq(q.field("isActive"), true)).collect();
    for (const feat of activeFeatures) {
      await ctx.db.insert("agencyFeatures", {
        agencyId,
        featureId: feat._id,
        isEnabled: true,
        sortOrder: feat.sortOrder,
      });
    }

    // 3. Create the theme
    await ctx.db.insert("agencyThemes", {
      agencyId,
      primaryColor: "#000000",
      accentColor: "#333333",
      backgroundColor: "#ffffff",
      sidebarColor: "#f4f4f5",
      textColor: "#111827",
      fontFamily: "Inter, sans-serif",
      borderRadius: "0.5rem",
      dashboardTitle: "Divinity Group Dashboard",
      updatedAt: Date.now(),
    });

    return `Created Divinity Group agency with ID: ${agencyId}`;
  },
});

export const promoteFirstUserToSuperAdmin = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      role: "SUPER_ADMIN",
      agencyId: undefined,
    });

    return "User promoted to SUPER_ADMIN";
  },
});

export const seedFeatureRegistry = internalMutation({
  handler: async (ctx) => {
    let inserted = 0;
    let updated = 0;
    for (const feature of INITIAL_FEATURES) {
      const existing = await ctx.db
        .query("features")
        .withIndex("by_key", (q) => q.eq("key", feature.key))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, feature);
        updated++;
      } else {
        await ctx.db.insert("features", feature);
        inserted++;
      }
    }
    return { inserted, updated };
  }
});

export const backfillAgencyFeaturesFromLegacy = internalMutation({
  handler: async (ctx) => {
    const agencies = await ctx.db.query("agencies").collect();
    const allFeatures = await ctx.db.query("features").collect();
    const activeFeatures = allFeatures.filter(f => f.isActive);
    let patched = 0;

    for (const agencyDoc of agencies) {
      const agency = agencyDoc as any;
      if (agency.featuresArray === undefined) continue;

      const keys = agency.featuresArray;
      if (keys.includes("all")) {
        for (const feat of activeFeatures) {
          const existingJoin = await ctx.db
            .query("agencyFeatures")
            .withIndex("by_agency_and_feature", (q) => 
               q.eq("agencyId", agency._id).eq("featureId", feat._id)
            )
            .unique();
          if (!existingJoin) {
            await ctx.db.insert("agencyFeatures", {
              agencyId: agency._id,
              featureId: feat._id,
              isEnabled: true,
              sortOrder: feat.sortOrder,
            });
          }
        }
      } else {
        for (const key of keys) {
          const feat = allFeatures.find(f => f.key === key);
          if (feat) {
            const existingJoin = await ctx.db
              .query("agencyFeatures")
              .withIndex("by_agency_and_feature", (q) => 
                 q.eq("agencyId", agency._id).eq("featureId", feat._id)
              )
              .unique();
            if (!existingJoin) {
              await ctx.db.insert("agencyFeatures", {
                agencyId: agency._id,
                featureId: feat._id,
                isEnabled: true,
                sortOrder: feat.sortOrder,
              });
            }
          }
        }
      }

      await ctx.db.patch(agency._id, { featuresArray: undefined } as any);
      patched++;
    }
    return { patched, total: agencies.length };
  }
});
