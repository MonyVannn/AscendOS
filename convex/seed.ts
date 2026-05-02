import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDev = mutation({
  args: {},
  handler: async (ctx) => {
    let agencyId = null;

    const existingAgency = await ctx.db
      .query("agencies")
      .withIndex("by_slug", (q) => q.eq("slug", "divinity-group"))
      .first();

    if (existingAgency) {
      agencyId = existingAgency._id;
    } else {
      agencyId = await ctx.db.insert("agencies", {
        name: "Divinity Group",
        slug: "divinity-group",
        ghlWebhookUrl: "https://example.com/webhook",
        ghlApiKey: "secret_api_key_123",
        featuresArray: ["crm", "automations", "reporting"],
        createdAt: Date.now(),
      });
    }

    const existingTheme = await ctx.db
      .query("agencyThemes")
      .withIndex("by_agency", (q) => q.eq("agencyId", agencyId))
      .first();

    if (!existingTheme) {
      await ctx.db.insert("agencyThemes", {
        agencyId,
        primaryColor: "#c8a96e",
        accentColor: "#e8c98e",
        backgroundColor: "#0f0f1a",
        sidebarColor: "#1a1a2e",
        textColor: "#f0f0f0",
        fontFamily: "Inter",
        borderRadius: "6px",
        dashboardTitle: "Divinity Hub",
        updatedAt: Date.now(),
      });
    }

    return "Seed complete!";
  },
});

export const linkDevUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const agency = await ctx.db
      .query("agencies")
      .withIndex("by_slug", (q) => q.eq("slug", "divinity-group"))
      .first();

    if (!agency) {
      throw new Error("Seed agency not found, run seedDev first");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { agencyId: agency._id });
    } else {
      await ctx.db.insert("users", {
        clerkId,
        agencyId: agency._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return "User linked to dev agency!";
  },
});
