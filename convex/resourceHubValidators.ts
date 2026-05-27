import { v } from "convex/values";

export const resourceCategoryValidator = v.union(
  v.literal("audio"),
  v.literal("document"),
  v.literal("video"),
  v.literal("image")
);
