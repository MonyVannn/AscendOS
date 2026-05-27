import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createLinkShare = mutation({
  args: {
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || !caller.agencyId) throw new Error("User or agency not found");

    const resource = await ctx.db.get(args.resourceId);
    if (!resource || resource.agencyId !== caller.agencyId) {
      throw new Error("Resource not found");
    }

    const token = crypto.randomUUID().replace(/-/g, "");

    const shareId = await ctx.db.insert("resourceShares", {
      agencyId: caller.agencyId,
      resourceId: args.resourceId,
      token,
      shareType: "link",
      sharedByUserId: caller._id,
      sharedAt: Date.now(),
      openCount: 0,
    });

    // Increment shareCount on the resource
    await ctx.db.patch(args.resourceId, {
      shareCount: (resource.shareCount || 0) + 1,
    });

    return { token, shareId };
  },
});

export const createContactShare = mutation({
  args: {
    resourceId: v.id("resources"),
    contactEmail: v.string(),
    contactName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || !caller.agencyId) throw new Error("User or agency not found");

    const resource = await ctx.db.get(args.resourceId);
    if (!resource || resource.agencyId !== caller.agencyId) {
      throw new Error("Resource not found");
    }

    const token = crypto.randomUUID().replace(/-/g, "");

    const shareId = await ctx.db.insert("resourceShares", {
      agencyId: caller.agencyId,
      resourceId: args.resourceId,
      token,
      shareType: "contact",
      sharedByUserId: caller._id,
      sharedAt: Date.now(),
      contactEmail: args.contactEmail,
      contactName: args.contactName,
      openCount: 0,
    });

    // Increment shareCount on the resource
    await ctx.db.patch(args.resourceId, {
      shareCount: (resource.shareCount || 0) + 1,
    });

    return { token, shareId };
  },
});

export const listSharesForResource = query({
  args: {
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || !caller.agencyId) return [];

    const shares = await ctx.db
      .query("resourceShares")
      .withIndex("by_resource", (q) => q.eq("resourceId", args.resourceId))
      .order("desc")
      .collect();

    // Filter to only shares for this agency (extra safety)
    return shares.filter((s) => s.agencyId === caller.agencyId);
  },
});

export const revokeShare = mutation({
  args: {
    shareId: v.id("resourceShares"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || !caller.agencyId) throw new Error("User or agency not found");

    const share = await ctx.db.get(args.shareId);
    if (!share || share.agencyId !== caller.agencyId) {
      throw new Error("Share not found");
    }

    await ctx.db.patch(args.shareId, {
      revokedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getSharedResourceByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("resourceShares")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!share || share.revokedAt) {
      return null;
    }

    const resource = await ctx.db.get(share.resourceId);
    if (!resource) {
      return null;
    }

    const agency = await ctx.db.get(resource.agencyId);

    let fileUrl = undefined;
    if (resource.storageId) {
      fileUrl = (await ctx.storage.getUrl(resource.storageId)) ?? undefined;
    }

    return {
      shareId: share._id,
      resource: {
        id: resource._id,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        fileType: resource.fileType,
        youtubeUrl: resource.youtubeUrl,
        fileUrl,
      },
      agency: {
        name: agency?.name ?? "Agency",
      },
    };
  },
});

export const recordShareOpen = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("resourceShares")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!share || share.revokedAt) {
      return null;
    }

    const patch: any = {
      openCount: (share.openCount || 0) + 1,
    };

    if (!share.openedAt) {
      patch.openedAt = Date.now();
    }

    await ctx.db.patch(share._id, patch);

    return { success: true };
  },
});

export const getShareStatsForAgency = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { monthlyShares: 0, nudgeList: [] };

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || !caller.agencyId) return { monthlyShares: 0, nudgeList: [] };

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const recentShares = await ctx.db
      .query("resourceShares")
      .withIndex("by_agency_shared_at", (q) => 
        q.eq("agencyId", caller.agencyId!).gte("sharedAt", firstDayOfMonth)
      )
      .collect();

    const monthlyShares = recentShares.filter(s => !s.revokedAt).length;

    // Nudge list: contact shares that haven't been opened and are not revoked
    // We'll just look at recent shares for the nudge list to keep it manageable
    const nudgeList = recentShares
      .filter(s => s.shareType === "contact" && !s.openedAt && !s.revokedAt)
      .map(s => ({
        id: s._id,
        resourceId: s.resourceId,
        contactName: s.contactName,
        contactEmail: s.contactEmail,
        sharedAt: s.sharedAt,
      }))
      .sort((a, b) => b.sharedAt - a.sharedAt)
      .slice(0, 10); // Top 10

    // Fetch resource titles for nudge list
    const nudgeListWithResources = await Promise.all(
      nudgeList.map(async (n) => {
        const resource = await ctx.db.get(n.resourceId);
        return {
          ...n,
          resourceTitle: resource?.title ?? "Unknown Resource",
        };
      })
    );

    return {
      monthlyShares,
      nudgeList: nudgeListWithResources,
    };
  },
});
