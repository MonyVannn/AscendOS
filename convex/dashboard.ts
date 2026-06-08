import { query } from "./_generated/server";
import { v } from "convex/values";
import { FEATURE_TO_TOOL_NAME, FEATURE_TO_WEBHOOK_KEY, IMPLEMENTED_FEATURE_KEYS } from "../src/lib/feature-tool-mapping";
import { buildDashboardMetrics } from "../src/lib/dashboard-period";
import { getEnabledIntegrationKeys } from "./lib/integrationEntitlements";

export const getSummary = query({
  args: {
    periodStartMs: v.number(),
    periodEndMs: v.number(),
    priorStartMs: v.number(),
    priorEndMs: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !user.agencyId) {
      return null;
    }

    const agency = await ctx.db.get(user.agencyId);
    if (!agency) {
      return null;
    }

    // Profile check
    const profileComplete = Boolean(
      user.name?.trim() && user.email?.trim() && user.bookingLink?.trim()
    );

    // GHL Connection check (mirroring tenant.ts)
    const effectiveToken = agency.ghlAccessToken?.trim() || agency.ghlApiKey?.trim() || "";
    const ghlConnected = Boolean(effectiveToken);

    // 1. Fetch enabled features
    const agencyFeatures = await ctx.db
      .query("agencyFeatures")
      .withIndex("by_agency", (q) => q.eq("agencyId", user.agencyId!))
      .collect();

    const enabledFeatures = [];
    for (const af of agencyFeatures) {
      if (!af.isEnabled) continue;
      const feat = await ctx.db.get(af.featureId);
      if (!feat || !feat.isActive) continue;
      enabledFeatures.push({
        key: feat.key,
        label: af.customLabel || feat.label,
        href: feat.href,
        icon: feat.icon,
        pillar: feat.pillar,
        type: feat.type,
      });
    }

    // 2. Fetch webhooks to determine "isLive"
    const enabledIntegrationKeys = await getEnabledIntegrationKeys(ctx.db, user.agencyId!);
    const webhooks = await ctx.db
      .query("agencyGhlInboundWebhooks")
      .withIndex("by_agency", (q) => q.eq("agencyId", user.agencyId!))
      .collect();
    
    const webhookUrlsByKey = new Map<string, string>();
    for (const wh of webhooks) {
      webhookUrlsByKey.set(wh.key, wh.url);
    }
    // Fallback for email template
    if (agency.ghlWebhookUrl?.trim()) {
      if (!webhookUrlsByKey.has("send-email-template") || webhookUrlsByKey.get("send-email-template") === "") {
        webhookUrlsByKey.set("send-email-template", agency.ghlWebhookUrl.trim());
      }
    }

    // 3. Filter Quick Actions + count ready forms
    type QuickAction = {
      featureKey: string;
      label: string;
      href: string;
      icon: string;
      pillar: string;
      isLive: boolean;
      isImplemented: boolean;
      thisWeekCount: number;
      allTimeCount: number;
      lastFiredAt: number | undefined;
    };
    const quickActions: QuickAction[] = [];
    let formsReadyCount = 0;

    for (const feat of enabledFeatures) {
      if (feat.type !== "smart-form" && feat.type !== "page") continue;
      if (feat.key === "resource-hub") continue; // Exclude, already in nav

      const webhookKey = FEATURE_TO_WEBHOOK_KEY[feat.key];
      const isLive = webhookKey ? (enabledIntegrationKeys.includes(webhookKey) && Boolean(webhookUrlsByKey.get(webhookKey)?.trim())) : true; // "page" features might not need webhooks, assume live. For MVP, we use webhooks for smart-forms.
      const isImplemented = IMPLEMENTED_FEATURE_KEYS.has(feat.key);

      if (feat.type === "smart-form" && isLive && isImplemented) {
        formsReadyCount++;
      }

      quickActions.push({
        featureKey: feat.key,
        label: feat.label,
        href: feat.href,
        icon: feat.icon,
        pillar: feat.pillar,
        isLive,
        isImplemented,
        thisWeekCount: 0,
        allTimeCount: 0,
        lastFiredAt: undefined as number | undefined,
      });
    }

    // 4. Fetch logs
    const allLogs = await ctx.db
      .query("webhookLogs")
      .withIndex("by_agency_submitted", (q) => q.eq("agencyId", user.agencyId!))
      .order("desc")
      .take(1000); // 1000 should be enough for quick actions count + metrics

    // 5. Compute Quick Actions stats
    for (const action of quickActions) {
      const targetToolName = FEATURE_TO_TOOL_NAME[action.featureKey];
      if (!targetToolName) continue;

      const toolLogs = allLogs.filter(l => l.toolName === targetToolName);
      action.allTimeCount = toolLogs.length;
      if (toolLogs.length > 0) {
        action.lastFiredAt = toolLogs[0].submittedAt;
      }
      
      const thisWeekLogs = toolLogs.filter(l => l.submittedAt >= args.periodStartMs && l.submittedAt <= args.periodEndMs);
      action.thisWeekCount = thisWeekLogs.length;
    }

    // 6. Compute Metrics
    const currentLogs = allLogs.filter(l => l.submittedAt >= args.periodStartMs && l.submittedAt <= args.periodEndMs);
    const priorLogs = allLogs.filter(l => l.submittedAt >= args.priorStartMs && l.submittedAt <= args.priorEndMs);

    const fieldTrainerEnrollments = await ctx.db
      .query("fieldTrainerEnrollments")
      .withIndex("by_agency", (q) => q.eq("agencyId", user.agencyId!))
      .collect();
      
    const activeAgentsTotal = fieldTrainerEnrollments.filter(e => e.programStatus === "active").length;
    const newAgentsCurrent = fieldTrainerEnrollments.filter(e => e.programStartedAt >= args.periodStartMs && e.programStartedAt <= args.periodEndMs).length;
    const newAgentsPrior = fieldTrainerEnrollments.filter(e => e.programStartedAt >= args.priorStartMs && e.programStartedAt <= args.priorEndMs).length;

    const resourceShares = await ctx.db
      .query("resourceShares")
      .withIndex("by_agency_shared_at", (q) => q.eq("agencyId", user.agencyId!))
      .collect();
      
    const currentResourcesShared = resourceShares.filter(s => s.sharedAt >= args.periodStartMs && s.sharedAt <= args.periodEndMs && (!s.revokedAt || s.revokedAt > s.sharedAt)).length;
    const priorResourcesShared = resourceShares.filter(s => s.sharedAt >= args.priorStartMs && s.sharedAt <= args.priorEndMs && (!s.revokedAt || s.revokedAt > s.sharedAt)).length;

    const metrics = buildDashboardMetrics(
      currentLogs.map(l => ({ contactEmail: l.contactEmail })),
      priorLogs.map(l => ({ contactEmail: l.contactEmail })),
      activeAgentsTotal,
      newAgentsCurrent,
      newAgentsPrior,
      currentResourcesShared,
      priorResourcesShared
    );

    // 7. Recent Activity (last 10 logs)
    const recentActivityLogs = allLogs.slice(0, 10);
    
    // Fetch user names for recent activity
    const userIds = new Set(recentActivityLogs.map(l => l.userId));
    const userMap = new Map<string, string>();
    for (const uid of Array.from(userIds)) {
      const u = await ctx.db.get(uid);
      if (u) {
        userMap.set(uid, u.name || "Unknown");
      }
    }

    const recentActivity = recentActivityLogs.map(l => {
      // Find matching label
      const matchedAction = quickActions.find(a => FEATURE_TO_TOOL_NAME[a.featureKey] === l.toolName);
      const toolLabel = matchedAction?.label || l.toolName;

      return {
        id: l._id,
        toolName: l.toolName,
        toolLabel,
        templateName: l.templateName,
        contactName: l.contactName || "—",
        userId: l.userId,
        userName: userMap.get(l.userId) || "Unknown",
        success: l.success,
        ghlStatus: l.ghlStatus,
        errorMessage: l.errorMessage,
        submittedAt: l.submittedAt,
      };
    });

    return {
      profileComplete,
      ghlConnected,
      formsReadyCount,
      metrics,
      quickActions,
      recentActivity,
    };
  },
});