import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

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
      featuresArray: ["all"],
      createdAt: Date.now(),
    });

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
