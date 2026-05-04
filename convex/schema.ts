import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agencies: defineTable({
    name: v.string(),
    slug: v.string(),
    ghlLocationId: v.optional(v.string()),
    ghlWebhookUrl: v.optional(v.string()),
    ghlAccessToken: v.optional(v.string()),
    /** Legacy; remove from schema after `seed:backfillAgencyGhlFields` has been run on all deployments. */
    ghlApiKey: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }).index("by_slug", ["slug"]),

  agencyThemes: defineTable({
    agencyId: v.id("agencies"),
    primaryColor: v.string(),
    accentColor: v.string(),
    backgroundColor: v.string(),
    sidebarColor: v.string(),
    textColor: v.string(),
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    fontFamily: v.string(),
    borderRadius: v.string(),
    dashboardTitle: v.string(),
    updatedAt: v.optional(v.number()),
  }).index("by_agency", ["agencyId"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("RD"), v.literal("SUPER_ADMIN"))),
    bookingLink: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    agencyId: v.optional(v.id("agencies")),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_agency", ["agencyId"]),

  webhookLogs: defineTable({
    agencyId: v.id("agencies"),
    payload: v.optional(v.any()), // maps to Json
    createdAt: v.optional(v.number()),
  }).index("by_agency", ["agencyId"]),

  features: defineTable({
    key: v.string(),
    label: v.string(),
    description: v.string(),
    pillar: v.union(
      v.literal("recruit"),
      v.literal("train"),
      v.literal("sell"),
      v.literal("team"),
      v.literal("account")
    ),
    type: v.union(v.literal("smart-form"), v.literal("iframe"), v.literal("page")),
    href: v.string(),
    defaultEmbedUrl: v.optional(v.string()),
    icon: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_pillar", ["pillar"]),

  agencyFeatures: defineTable({
    agencyId: v.id("agencies"),
    featureId: v.id("features"),
    isEnabled: v.boolean(),
    customEmbedUrl: v.optional(v.string()),
    customLabel: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  })
    .index("by_agency", ["agencyId"])
    .index("by_agency_and_feature", ["agencyId", "featureId"]),
});
