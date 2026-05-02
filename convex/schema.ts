import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agencies: defineTable({
    name: v.string(),
    slug: v.string(),
    ghlWebhookUrl: v.string(),
    ghlApiKey: v.string(),
    featuresArray: v.array(v.string()),
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
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    agencyId: v.optional(v.id("agencies")),
  }).index("by_clerk", ["clerkId"]),

  webhookLogs: defineTable({
    agencyId: v.id("agencies"),
    payload: v.optional(v.any()), // maps to Json
    createdAt: v.optional(v.number()),
  }).index("by_agency", ["agencyId"]),
});
