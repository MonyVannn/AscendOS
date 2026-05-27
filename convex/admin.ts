import { query, mutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

import { agencyRoleValidator } from "./roles";

export const assignUserToAgency = mutation({
  args: {
    clerkId: v.string(),
    agencyId: v.id("agencies"),
    role: agencyRoleValidator,
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

export const promoteToSuperAdmin = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    await requireSuperAdmin(ctx);

    const target = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!target) throw new Error("User not found");

    await ctx.db.patch(target._id, { role: "SUPER_ADMIN", agencyId: undefined });

    return { success: true };
  },
});

export const revokeSuperAdmin = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    await requireSuperAdmin(ctx);

    const target = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!target) throw new Error("User not found");

    if (target.role !== "SUPER_ADMIN") {
      throw new Error("User is not a Super Admin");
    }

    await ctx.db.patch(target._id, { role: undefined, agencyId: undefined });

    return { success: true };
  },
});

export const listUnprovisionedUsers = query({
  args: {
    refreshNonce: v.optional(v.number()),
  },
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

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

export const listPlatformAdmins = query({
  args: {
    refreshNonce: v.optional(v.number()),
  },
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "SUPER_ADMIN"))
      .collect();
  },
});

export const listAgencyMembers = query({
  args: { agencyId: v.id("agencies") },
  handler: async (ctx, { agencyId }) => {
    await requireSuperAdmin(ctx);

    return await ctx.db
      .query("users")
      .withIndex("by_agency", (q) => q.eq("agencyId", agencyId))
      .collect();
  },
});

export const updateAgencyMemberRole = mutation({
  args: {
    userId: v.id("users"),
    role: agencyRoleValidator,
  },
  handler: async (ctx, { userId, role }) => {
    await requireSuperAdmin(ctx);

    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");
    if (target.role === "SUPER_ADMIN") throw new Error("Cannot change role of Super Admin");
    if (!target.agencyId) throw new Error("User does not belong to an agency");

    await ctx.db.patch(target._id, { role });

    return { success: true };
  },
});

export const listAgencies = query({
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

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
      const memberCount = allUsers.filter(u => u.agencyId === a._id && (u.role === "RD" || u.role === "MD" || u.role === "AGENT")).length;
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
        memberCount,
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

const SEND_EMAIL_TEMPLATE_KEY = "send-email-template";

type AdminCtx = QueryCtx | MutationCtx;

async function requireSuperAdmin(ctx: AdminCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  const caller = await ctx.db
    .query("users")
    .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!caller || caller.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}

export const listAgencyInboundWebhooks = query({
  args: { agencyId: v.id("agencies") },
  handler: async (ctx, { agencyId }) => {
    await requireSuperAdmin(ctx);

    const agency = await ctx.db.get(agencyId);
    if (!agency) {
      throw new Error("Agency not found");
    }

    const keyed = await ctx.db
      .query("agencyGhlInboundWebhooks")
      .withIndex("by_agency", (q) => q.eq("agencyId", agencyId))
      .collect();

    type WebhookListItem = {
      key: string;
      url: string;
      updatedAt?: number;
      source: "keyed" | "legacy";
      webhookId?: Id<"agencyGhlInboundWebhooks">;
    };

    const webhooks: WebhookListItem[] = keyed.map((w) => ({
      key: w.key,
      url: w.url,
      updatedAt: w.updatedAt,
      source: "keyed" as const,
      webhookId: w._id,
    }));

    const hasSendEmailKeyed = webhooks.some(
      (r) => r.key === SEND_EMAIL_TEMPLATE_KEY
    );
    const legacyUrl = agency.ghlWebhookUrl?.trim();
    if (!hasSendEmailKeyed && legacyUrl) {
      webhooks.push({
        key: SEND_EMAIL_TEMPLATE_KEY,
        url: legacyUrl,
        source: "legacy",
      });
    }

    return {
      agency: {
        _id: agency._id,
        name: agency.name,
        slug: agency.slug,
      },
      webhooks,
    };
  },
});

export const upsertAgencyInboundWebhook = mutation({
  args: {
    agencyId: v.id("agencies"),
    key: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    if (!args.url.trim()) {
      throw new Error("Webhook URL cannot be empty");
    }

    const existing = await ctx.db
      .query("agencyGhlInboundWebhooks")
      .withIndex("by_agency_and_key", (q) => q.eq("agencyId", args.agencyId).eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        url: args.url.trim(),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("agencyGhlInboundWebhooks", {
        agencyId: args.agencyId,
        key: args.key,
        url: args.url.trim(),
        updatedAt: Date.now(),
      });
    }

    if (args.key === SEND_EMAIL_TEMPLATE_KEY) {
      const agency = await ctx.db.get(args.agencyId);
      if (agency?.ghlWebhookUrl !== undefined) {
        await ctx.db.patch(args.agencyId, { ghlWebhookUrl: undefined });
      }
    }

    return { success: true };
  },
});

export const deleteAgencyInboundWebhook = mutation({
  args: {
    agencyId: v.id("agencies"),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const existing = await ctx.db
      .query("agencyGhlInboundWebhooks")
      .withIndex("by_agency_and_key", (q) => q.eq("agencyId", args.agencyId).eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    if (args.key === SEND_EMAIL_TEMPLATE_KEY) {
      const agency = await ctx.db.get(args.agencyId);
      if (agency?.ghlWebhookUrl !== undefined) {
        await ctx.db.patch(args.agencyId, { ghlWebhookUrl: undefined });
      }
    }

    return { success: true };
  },
});

export const createAgency = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    ghlLocationId: v.string(),
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
        logoStorageId: undefined,
        faviconUrl: undefined,
        faviconStorageId: undefined,
        fontFamily: "Inter",
        borderRadius: "8px",
        dashboardTitle: args.name,
        updatedAt: Date.now(),
      });
    }

    return agencyId;
  }
});
