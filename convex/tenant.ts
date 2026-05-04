import { query } from "./_generated/server";

export const getTenantContext = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // `identity.subject` is the clerk userId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    if (!user.agencyId) {
      return { user, agency: null, theme: null, ghlConnected: false };
    }

    const agency = await ctx.db.get(user.agencyId);

    if (!agency) {
      return { user, agency: null, theme: null, ghlConnected: false };
    }

    const theme = await ctx.db
      .query("agencyThemes")
      .withIndex("by_agency", (q) => q.eq("agencyId", agency._id))
      .first();

    // Sanitize secrets (support legacy ghlApiKey until backfill runs)
    const effectiveToken =
      agency.ghlAccessToken?.trim() || agency.ghlApiKey?.trim() || "";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ghlAccessToken, ghlApiKey, ghlWebhookUrl, ...sanitizedAgency } =
      agency;

    return {
      user,
      agency: sanitizedAgency,
      theme: theme || null,
      ghlConnected: Boolean(effectiveToken),
    };
  },
});
