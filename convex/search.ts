import { query } from "./_generated/server";
import { v } from "convex/values";
import { getToolDisplayName } from "../src/lib/feature-tool-mapping";

export const globalSearch = query({
  args: {
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { agents: [], submissions: [], resources: [] };
    }

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || !caller.agencyId) {
      return { agents: [], submissions: [], resources: [] };
    }

    const agencyId = caller.agencyId;
    const search = args.searchQuery.trim().toLowerCase();
    
    if (!search) {
      return { agents: [], submissions: [], resources: [] };
    }

    const limit = args.limit || 5;

    // 1. Search Agents (Field Trainer Enrollments)
    const enrollments = await ctx.db
      .query("fieldTrainerEnrollments")
      .withIndex("by_agency", (q) => q.eq("agencyId", agencyId))
      .collect();

    const activeEnrollments = enrollments.filter(e => e.programStatus !== "withdrawn");
    const agents = [];
    
    for (const e of activeEnrollments) {
      if (agents.length >= limit) break;
      
      let rdName = "Unknown";
      if (e.assignedRdUserId) {
        const rd = await ctx.db.get(e.assignedRdUserId);
        rdName = rd?.name || rd?.email || "Unknown";
      }

      if (
        e.firstName.toLowerCase().includes(search) ||
        e.phone.toLowerCase().includes(search) ||
        e.fieldTrainer.toLowerCase().includes(search) ||
        rdName.toLowerCase().includes(search)
      ) {
        agents.push({
          id: e._id,
          label: e.firstName,
          subtitle: `${e.fieldTrainer} · ${e.phone}`,
          href: `/dashboard/field-trainer-timeline?enrollment=${e._id}`
        });
      }
    }

    // 2. Search Submissions (Webhook Logs)
    // We scan the most recent 200 logs
    const recentLogs = await ctx.db
      .query("webhookLogs")
      .withIndex("by_agency_submitted", (q) => q.eq("agencyId", agencyId))
      .order("desc")
      .take(200);

    const submissions = [];
    for (const log of recentLogs) {
      if (submissions.length >= limit) break;
      
      const toolName = getToolDisplayName(log.toolName);
      if (
        log.contactName?.toLowerCase().includes(search) ||
        log.contactEmail.toLowerCase().includes(search) ||
        toolName.toLowerCase().includes(search)
      ) {
        submissions.push({
          id: log._id,
          label: log.contactName || log.contactEmail,
          subtitle: toolName,
          href: `/dashboard/activity-log?q=${encodeURIComponent(log.contactEmail)}`
        });
      }
    }

    // 3. Search Resources
    const allResources = await ctx.db
      .query("resources")
      .withIndex("by_agency", (q) => q.eq("agencyId", agencyId))
      .order("desc")
      .collect();

    const resources = [];
    for (const r of allResources) {
      if (resources.length >= limit) break;

      if (
        r.title.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search) ||
        r.tag.toLowerCase().includes(search)
      ) {
        resources.push({
          id: r._id,
          label: r.title,
          subtitle: r.category.charAt(0).toUpperCase() + r.category.slice(1),
          href: `/dashboard/account/resource-hub?q=${encodeURIComponent(r.title)}`
        });
      }
    }

    return { agents, submissions, resources };
  },
});
