import { query } from "./_generated/server";

export const listActive = query({
  handler: async (ctx) => {
    const features = await ctx.db
      .query("features")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Sort by pillar, then sortOrder
    return features.sort((a, b) => {
      if (a.pillar === b.pillar) {
        return a.sortOrder - b.sortOrder;
      }
      return a.pillar.localeCompare(b.pillar);
    });
  },
});
