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
    const agencyFeatures = await ctx.db
      .query("agencyFeatures")
      .withIndex("by_agency", (q) => q.eq("agencyId", agency._id))
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
        type: feat.type,
        icon: feat.icon,
        pillar: feat.pillar,
        embedUrl: af.customEmbedUrl || feat.defaultEmbedUrl,
        sortOrder: af.sortOrder ?? feat.sortOrder,
      });
    }

    enabledFeatures.sort((a, b) => a.sortOrder - b.sortOrder);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ghlAccessToken, ghlApiKey, ghlWebhookUrl, ...sanitizedAgency } =
      agency;

    return {
      user,
      agency: sanitizedAgency,
      theme: theme || null,
      ghlConnected: Boolean(effectiveToken),
      enabledFeatures,
    };
  },
});
