import { query } from "./_generated/server";
import { v } from "convex/values";

export const readInboundWebhookUrl = query({
  args: { key: v.string() },
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

    // Security tradeoff: any authenticated Convex client with a valid JWT could call this query directly
    // and learn the webhook URL for their agency. Stronger isolation would be a Convex httpAction
    // gated by a server-only bearer secret.

    // 1. Check for specific keyed webhook
    const webhook = await ctx.db
      .query("agencyGhlInboundWebhooks")
      .withIndex("by_agency_and_key", (q) => q.eq("agencyId", user.agencyId!).eq("key", args.key))
      .first();

    if (webhook && webhook.url.trim() !== "") {
      return webhook.url.trim();
    }

    // 2. Fallback to legacy webhook URL for send-email-template
    if (args.key === "send-email-template" && agency.ghlWebhookUrl?.trim()) {
      return agency.ghlWebhookUrl.trim();
    }

    return null;
  },
});
