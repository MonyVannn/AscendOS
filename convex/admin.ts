import { query, mutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

import { agencyRoleValidator } from "./roles";
import { getEnabledIntegrationKeys, setIntegrationEnabled, KNOWN_INTEGRATION_KEYS } from "./lib/integrationEntitlements";

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

export const getDashboardSummary = query({
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

    const now = Date.now();
    const oneDayAgo = now - 86400000;

    const agencies = await ctx.db.query("agencies").collect();
    const users = await ctx.db.query("users").collect();
    
    // We only need the last 24h for metrics, but we also want the 15 most recent for the feed.
    // At admin scale, collecting all webhooks might be slow in the future, but okay for v1 as noted in the plan.
    const allWebhooks = await ctx.db.query("webhookLogs").order("desc").collect();

    // 1. Users
    const platformAdmins = users.filter(u => u.role === "SUPER_ADMIN").length;
    const unprovisionedUsers = users.filter(u => !u.agencyId && u.role !== "SUPER_ADMIN").length;
    const provisionedUsers = users.filter(u => u.agencyId && (u.role === "RD" || u.role === "MD" || u.role === "AGENT")).length;

    // 2. Agencies
    let activeAgencies = 0;
    let onboardingAgencies = 0;

    const agencySnapshotRaw = agencies.map(a => {
      const rdCount = users.filter(u => u.agencyId === a._id && u.role === "RD").length;
      const memberCount = users.filter(u => u.agencyId === a._id && (u.role === "RD" || u.role === "MD" || u.role === "AGENT")).length;
      const webhookCount = allWebhooks.filter(w => w.agencyId === a._id).length;
      
      const status: "ACTIVE" | "ONBOARDING" = rdCount >= 1 ? "ACTIVE" : "ONBOARDING";
      
      if (status === "ACTIVE") activeAgencies++;
      else onboardingAgencies++;

      return {
        _id: a._id,
        name: a.name,
        slug: a.slug,
        status,
        memberCount,
        webhookCount,
        rdCount,
      };
    });

    // 3. Webhooks 24h
    const webhooks24hData = allWebhooks.filter(w => w.submittedAt >= oneDayAgo);
    const totalWebhooks24h = webhooks24hData.length;
    const failedWebhooks24h = webhooks24hData.filter(w => !w.success).length;
    const successRate24h = totalWebhooks24h > 0 
      ? Math.round(((totalWebhooks24h - failedWebhooks24h) / totalWebhooks24h) * 100) 
      : 100;

    // 4. Recent Activity (top 15)
    const recentLogs = allWebhooks.slice(0, 15);
    const recentActivity = recentLogs.map(l => {
      const agency = agencies.find(a => a._id === l.agencyId);
      const user = users.find(u => u._id === l.userId);
      return {
        id: l._id,
        submittedAt: l.submittedAt,
        agencyName: agency?.name || "Unknown",
        agencySlug: agency?.slug || "unknown",
        userName: user?.name || "Unknown",
        toolName: l.toolName,
        contactName: l.contactName || "—",
        success: l.success,
        errorMessage: l.errorMessage,
      };
    });

    // 5. System Health
    let healthStatus: "healthy" | "attention" | "degraded" = "healthy";
    let healthLabel = "Systems operating normally";

    if (successRate24h < 90 || unprovisionedUsers > 5) {
      healthStatus = "attention";
      healthLabel = "Minor issues require review";
    }
    if (successRate24h < 80) {
      healthStatus = "degraded";
      healthLabel = "Elevated webhook failures";
    }

    // 6. Attention Items
    const attentionItems: Array<{ id: string, title: string, description: string, href: string, severity: "warning" | "destructive" }> = [];
    
    if (unprovisionedUsers > 0) {
      attentionItems.push({
        id: "unprovisioned",
        title: "Users Awaiting Assignment",
        description: `${unprovisionedUsers} user(s) signed up and need to be assigned to an agency.`,
        href: "/admin/assign",
        severity: "warning",
      });
    }

    if (onboardingAgencies > 0) {
      attentionItems.push({
        id: "onboarding",
        title: "Agencies in Onboarding",
        description: `${onboardingAgencies} agency/agencies are still in onboarding (no RD assigned).`,
        href: "/admin/agencies",
        severity: "warning",
      });
    }

    if (successRate24h < 90) {
      attentionItems.push({
        id: "webhooks",
        title: "Elevated Webhook Failures",
        description: `Webhook success rate has dropped to ${successRate24h}% in the last 24 hours.`,
        href: "/admin/webhooks",
        severity: "destructive",
      });
    }

    // 7. Agency Snapshot (Onboarding first, then by rdCount asc)
    const agencySnapshot = agencySnapshotRaw
      .sort((a, b) => {
        if (a.status === "ONBOARDING" && b.status === "ACTIVE") return -1;
        if (a.status === "ACTIVE" && b.status === "ONBOARDING") return 1;
        return a.rdCount - b.rdCount;
      })
      .slice(0, 5)
      .map(a => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rdCount, ...rest } = a;
        return rest;
      });

    return {
      generatedAt: now,
      counts: {
        totalAgencies: agencies.length,
        activeAgencies,
        onboardingAgencies,
        provisionedUsers,
        unprovisionedUsers,
        platformAdmins,
      },
      webhook24h: {
        total: totalWebhooks24h,
        failed: failedWebhooks24h,
        successRate: successRate24h,
      },
      systemHealth: {
        status: healthStatus,
        label: healthLabel,
      },
      attentionItems,
      recentActivity,
      agencySnapshot,
    };
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

export const listAgencyFeatures = query({
  args: { agencyId: v.id("agencies") },
  handler: async (ctx, { agencyId }) => {
    await requireSuperAdmin(ctx);

    const agency = await ctx.db.get(agencyId);
    if (!agency) {
      throw new Error("Agency not found");
    }

    const allFeatures = await ctx.db.query("features").collect();
    const activeFeatures = allFeatures.filter((f) => f.isActive);
    
    const agencyFeatures = await ctx.db
      .query("agencyFeatures")
      .withIndex("by_agency", (q) => q.eq("agencyId", agencyId))
      .collect();

    const result = activeFeatures.map((feat) => {
      const af = agencyFeatures.find((a) => a.featureId === feat._id);
      return {
        featureId: feat._id,
        key: feat.key,
        label: feat.label,
        pillar: feat.pillar,
        customLabel: af?.customLabel,
        isEnabled: af?.isEnabled ?? false,
        sortOrder: af?.sortOrder ?? feat.sortOrder,
      };
    });

    return {
      agency: {
        _id: agency._id,
        name: agency.name,
        slug: agency.slug,
      },
      features: result,
    };
  },
});

export const toggleAgencyFeature = mutation({
  args: {
    agencyId: v.id("agencies"),
    featureKey: v.string(),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const feature = await ctx.db
      .query("features")
      .withIndex("by_key", (q) => q.eq("key", args.featureKey))
      .unique();

    if (!feature || !feature.isActive) {
      throw new Error(`Unknown or inactive feature key: ${args.featureKey}`);
    }

    const existingJoin = await ctx.db
      .query("agencyFeatures")
      .withIndex("by_agency_and_feature", (q) => 
        q.eq("agencyId", args.agencyId).eq("featureId", feature._id)
      )
      .unique();

    if (existingJoin) {
      await ctx.db.patch(existingJoin._id, { isEnabled: args.isEnabled });
    } else if (args.isEnabled) {
      await ctx.db.insert("agencyFeatures", {
        agencyId: args.agencyId,
        featureId: feature._id,
        isEnabled: true,
        sortOrder: feature.sortOrder,
      });
    }
    return { success: true };
  },
});

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

    const enabledIntegrationKeys = await getEnabledIntegrationKeys(ctx.db, agencyId);

    return {
      agency: {
        _id: agency._id,
        name: agency.name,
        slug: agency.slug,
      },
      webhooks,
      enabledIntegrationKeys,
    };
  },
});

export const toggleAgencyIntegration = mutation({
  args: {
    agencyId: v.id("agencies"),
    key: v.string(),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    await setIntegrationEnabled(ctx.db, args.agencyId, args.key, args.isEnabled);

    if (!args.isEnabled) {
      // optionally delete the webhook URL row for that key
      const existingUrl = await ctx.db
        .query("agencyGhlInboundWebhooks")
        .withIndex("by_agency_and_key", (q) => q.eq("agencyId", args.agencyId).eq("key", args.key))
        .first();

      if (existingUrl) {
        await ctx.db.delete(existingUrl._id);
      }
      
      if (args.key === SEND_EMAIL_TEMPLATE_KEY) {
        const agency = await ctx.db.get(args.agencyId);
        if (agency?.ghlWebhookUrl !== undefined) {
          await ctx.db.patch(args.agencyId, { ghlWebhookUrl: undefined });
        }
      }
    }
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
    integrationKeys: v.array(v.string()),
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

    const validIntegrations = [];
    for (const key of args.integrationKeys) {
      if (KNOWN_INTEGRATION_KEYS.includes(key)) {
        validIntegrations.push(key);
      }
    }

    for (const key of validIntegrations) {
      await setIntegrationEnabled(ctx.db, agencyId, key, true);
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

export const listWebhookLogs = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(v.literal("all"), v.literal("sent"), v.literal("failed"))),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    search: v.optional(v.string()),
    agencyId: v.optional(v.id("agencies")),
    toolName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const hasSearch = args.search && args.search.trim().length > 0;
    const searchQuery = hasSearch ? args.search!.trim().toLowerCase() : "";

    let isDone = false;
    let continueCursor = args.paginationOpts.cursor;
    const page = [];
    const targetCount = args.paginationOpts.numItems;

    while (page.length < targetCount && !isDone) {
      const batchSize = hasSearch ? 50 : targetCount - page.length;

      let q;
      if (args.agencyId) {
        q = ctx.db
          .query("webhookLogs")
          .withIndex("by_agency_submitted", (q) => {
            const indexQuery = q.eq("agencyId", args.agencyId!);
            if (args.dateTo !== undefined) {
              return indexQuery.lte("submittedAt", args.dateTo);
            }
            return indexQuery;
          })
          .order("desc");
      } else {
        q = ctx.db
          .query("webhookLogs")
          .withIndex("by_submitted", (q) => {
            if (args.dateTo !== undefined) {
              return q.lte("submittedAt", args.dateTo);
            }
            return q;
          })
          .order("desc");
      }

      if (args.dateFrom !== undefined) {
        q = q.filter((q) => q.gte(q.field("submittedAt"), args.dateFrom!));
      }

      if (args.status === "sent") {
        q = q.filter((q) => q.eq(q.field("success"), true));
      } else if (args.status === "failed") {
        q = q.filter((q) => q.eq(q.field("success"), false));
      }

      if (args.toolName && args.toolName !== "all") {
        q = q.filter((q) => q.eq(q.field("toolName"), args.toolName!));
      }

      const result = await q.paginate({ cursor: continueCursor, numItems: batchSize });

      // batch-load agencies and users
      const agencyIds = new Set<Id<"agencies">>();
      const userIds = new Set<Id<"users">>();
      for (const log of result.page) {
        agencyIds.add(log.agencyId);
        userIds.add(log.userId);
      }

      const agencies = new Map();
      const users = new Map();

      for (const aid of agencyIds) {
        const ag = await ctx.db.get(aid);
        if (ag) agencies.set(aid, ag);
      }
      for (const uid of userIds) {
        const u = await ctx.db.get(uid);
        if (u) users.set(uid, u);
      }

      for (const log of result.page) {
        const agency = agencies.get(log.agencyId);
        const user = users.get(log.userId);

        let matches = true;
        if (hasSearch) {
          const matchContactName = log.contactName?.toLowerCase().includes(searchQuery) ?? false;
          const matchEmail = log.contactEmail?.toLowerCase().includes(searchQuery) ?? false;
          const matchTool = log.toolName?.toLowerCase().includes(searchQuery) ?? false;
          const matchAgencyName = agency?.name.toLowerCase().includes(searchQuery) ?? false;
          const matchAgencySlug = agency?.slug.toLowerCase().includes(searchQuery) ?? false;
          const matchUserName = user?.name.toLowerCase().includes(searchQuery) ?? false;
          
          matches = matchContactName || matchEmail || matchTool || matchAgencyName || matchAgencySlug || matchUserName;
        }

        if (matches) {
          page.push({
            _id: log._id,
            submittedAt: log.submittedAt,
            contactName: log.contactName,
            contactEmail: log.contactEmail,
            templateName: log.templateName,
            toolName: log.toolName,
            success: log.success,
            errorMessage: log.errorMessage,
            latencyMs: log.latencyMs,
            retried: log.retried,
            agencyId: log.agencyId,
            agencyName: agency?.name || "Unknown",
            agencySlug: agency?.slug || "unknown",
            userId: log.userId,
            userName: user?.name || "Unknown",
          });
        }
      }

      continueCursor = result.continueCursor;
      isDone = result.isDone;

      if (!hasSearch) {
        break;
      }
    }

    return {
      page,
      continueCursor,
      isDone,
    };
  },
});
