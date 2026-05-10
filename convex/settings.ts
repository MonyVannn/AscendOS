import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateMyProfile = mutation({
  args: {
    name: v.string(),
    bookingLink: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller) throw new Error("User not found");
    if (!caller.agencyId) throw new Error("No agency associated with your profile");

    const trimmedName = args.name.trim();
    if (!trimmedName) throw new Error("Name cannot be empty");

    const trimmedLink = args.bookingLink.trim();
    if (!trimmedLink.startsWith("https://")) {
      throw new Error("Booking link must start with https://");
    }

    await ctx.db.patch(caller._id, {
      name: trimmedName,
      bookingLink: trimmedLink,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateMyAgencyTheme = mutation({
  args: {
    primaryColor: v.string(),
    accentColor: v.string(),
    backgroundColor: v.string(),
    sidebarColor: v.string(),
    textColor: v.string(),

    // Sidebar
    sidebarBg: v.optional(v.string()),
    sidebarItemText: v.optional(v.string()),
    sidebarSectionLabel: v.optional(v.string()),
    sidebarHoverBg: v.optional(v.string()),
    sidebarActiveItemBg: v.optional(v.string()),

    // Content
    pageBg: v.optional(v.string()),
    cardBg: v.optional(v.string()),
    cardInnerBg: v.optional(v.string()),
    borderColor: v.optional(v.string()),

    // Typography
    headingText: v.optional(v.string()),
    bodyText: v.optional(v.string()),
    mutedText: v.optional(v.string()),

    // Interactive
    primaryForeground: v.optional(v.string()),

    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    fontFamily: v.string(),
    borderRadius: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller) throw new Error("User not found");
    if (!caller.agencyId) throw new Error("No agency associated with your profile");

    const theme = await ctx.db
      .query("agencyThemes")
      .withIndex("by_agency", (q) => q.eq("agencyId", caller.agencyId!))
      .unique();

    if (!theme) throw new Error("Agency theme not found");

    const patch = {
      primaryColor: args.primaryColor,
      accentColor: args.accentColor,
      backgroundColor: args.pageBg || args.backgroundColor,
      sidebarColor: args.sidebarBg || args.sidebarColor,
      textColor: args.bodyText || args.textColor,
      
      sidebarBg: args.sidebarBg,
      sidebarItemText: args.sidebarItemText,
      sidebarSectionLabel: args.sidebarSectionLabel,
      sidebarHoverBg: args.sidebarHoverBg,
      sidebarActiveItemBg: args.sidebarActiveItemBg,

      pageBg: args.pageBg,
      cardBg: args.cardBg,
      cardInnerBg: args.cardInnerBg,
      borderColor: args.borderColor,

      headingText: args.headingText,
      bodyText: args.bodyText,
      mutedText: args.mutedText,

      primaryForeground: args.primaryForeground,

      logoUrl: args.logoUrl,
      faviconUrl: args.faviconUrl,
      fontFamily: args.fontFamily,
      borderRadius: args.borderRadius,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(theme._id, patch);

    return { 
      success: true,
      theme: patch,
    };
  },
});
