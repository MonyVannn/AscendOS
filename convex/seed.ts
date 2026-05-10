import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { INITIAL_FEATURES } from "./featureRegistry";

/**
 * One-time: backfills optional expanded fields in `agencyThemes` based on legacy tokens.
 * Run from project root:
 * `npx convex run seed:backfillAgencyThemeExpandedFields`
 */
export const backfillAgencyThemeExpandedFields = internalMutation({
  handler: async (ctx) => {
    const themes = await ctx.db.query("agencyThemes").collect();
    let patched = 0;
    
    for (const t of themes) {
      // If pageBg is already present, assume it has been expanded.
      if (t.pageBg) continue;

      const pageBg = t.backgroundColor || "#f6f5f4";
      const cardBg = "#ffffff";
      const cardInnerBg = "#f4f4f5";
      const borderColor = "#e4e4e7";

      const headingText = t.textColor || "#111827";
      const bodyText = t.textColor || "#111827";
      const mutedText = "#71717a";

      const sidebarBg = t.sidebarColor || "#1F1E1C";
      const sidebarItemText = "#a1a1aa";
      const sidebarSectionLabel = "#71717a";
      const sidebarHoverBg = "rgba(255, 255, 255, 0.05)";
      const sidebarActiveItemBg = "rgba(255, 255, 255, 0.1)";

      // we could compute foregrounds, but skipping here because resolveAgencyTheme 
      // already handles fallback for primaryForeground and we don't have access to getContrastingForeground directly.

      await ctx.db.patch(t._id, {
        pageBg,
        cardBg,
        cardInnerBg,
        borderColor,
        headingText,
        bodyText,
        mutedText,
        sidebarBg,
        sidebarItemText,
        sidebarSectionLabel,
        sidebarHoverBg,
        sidebarActiveItemBg,
      });
      patched++;
    }
    
    return { patched, total: themes.length };
  },
});

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

      sidebarBg: "#f4f4f5",
      sidebarItemText: "#71717a",
      sidebarSectionLabel: "#a1a1aa",
      sidebarHoverBg: "rgba(0, 0, 0, 0.05)",
      sidebarActiveItemBg: "rgba(0, 0, 0, 0.1)",
      
      pageBg: "#f6f5f4",
      cardBg: "#ffffff",
      cardInnerBg: "#f4f4f5",
      borderColor: "#e4e4e7",
      
      headingText: "#111827",
      bodyText: "#111827",
      mutedText: "#71717a",

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
