import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

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
      ghlWebhookUrl: "",
      ghlApiKey: "",
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
