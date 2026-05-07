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

    await ctx.db.patch(theme._id, {
      primaryColor: args.primaryColor,
      accentColor: args.accentColor,
      backgroundColor: args.backgroundColor,
      sidebarColor: args.sidebarColor,
      textColor: args.textColor,
      logoUrl: args.logoUrl,
      faviconUrl: args.faviconUrl,
      fontFamily: args.fontFamily,
      borderRadius: args.borderRadius,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
