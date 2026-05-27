import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { resourceCategoryValidator } from "./resourceHubValidators";

export const listResources = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || !caller.agencyId) return [];

    const resources = await ctx.db
      .query("resources")
      .withIndex("by_agency", (q) => q.eq("agencyId", caller.agencyId!))
      .order("desc")
      .collect();

    // Attach fileUrls if storageId exists
    return await Promise.all(
      resources.map(async (r) => {
        let fileUrl = undefined;
        if (r.storageId) {
          fileUrl = (await ctx.storage.getUrl(r.storageId)) ?? undefined;
        }
        return {
          ...r,
          id: r._id, // map _id to id for frontend compatibility
          fileUrl,
        };
      })
    );
  },
});

export const generateResourceUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller) throw new Error("User not found");
    if (!caller.agencyId) throw new Error("No agency associated with your profile");

    return await ctx.storage.generateUploadUrl();
  },
});

export const finalizeResourceUpload = mutation({
  args: {
    category: v.union(v.literal("audio"), v.literal("document"), v.literal("image")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller) throw new Error("User not found");
    if (!caller.agencyId) throw new Error("No agency associated with your profile");

    const metadata = await ctx.db.system.get("_storage", args.storageId);
    if (!metadata) throw new Error("File not found");

    // Max size 25MB
    if (metadata.size > 25 * 1024 * 1024) {
      await ctx.storage.delete(args.storageId);
      throw new Error("File too large. Maximum size is 25MB.");
    }

    let validTypes: string[] = [];
    let fileType = "Unknown";
    
    if (args.category === "document") {
      validTypes = [
        "application/pdf", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
      ];
      if (metadata.contentType === "application/pdf") fileType = "PDF";
      else if (metadata.contentType?.includes("wordprocessingml") || metadata.contentType === "application/msword") fileType = "DOCX";
    } else if (args.category === "audio") {
      validTypes = [
        "audio/mpeg", 
        "audio/mp3",
        "audio/mp4", 
        "audio/wav", 
        "audio/ogg",
        "audio/x-m4a"
      ];
      if (metadata.contentType?.includes("mpeg") || metadata.contentType?.includes("mp3")) fileType = "MP3";
      else if (metadata.contentType?.includes("wav")) fileType = "WAV";
      else if (metadata.contentType?.includes("ogg")) fileType = "OGG";
      else if (metadata.contentType?.includes("mp4") || metadata.contentType?.includes("m4a")) fileType = "M4A";
    } else if (args.category === "image") {
      validTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
        "image/svg+xml"
      ];
      if (metadata.contentType === "image/png") fileType = "PNG";
      else if (metadata.contentType === "image/jpeg") fileType = "JPG";
      else if (metadata.contentType === "image/webp") fileType = "WEBP";
      else if (metadata.contentType === "image/gif") fileType = "GIF";
      else if (metadata.contentType === "image/svg+xml") fileType = "SVG";
    }

    if (!metadata.contentType || !validTypes.includes(metadata.contentType)) {
      await ctx.storage.delete(args.storageId);
      throw new Error(`Invalid file type for ${args.category}. Got: ${metadata.contentType}`);
    }

    return { 
      storageId: args.storageId, 
      fileType, 
      contentType: metadata.contentType 
    };
  },
});

export const createResource = mutation({
  args: {
    category: resourceCategoryValidator,
    title: v.string(),
    description: v.string(),
    tag: v.string(),
    storageId: v.optional(v.id("_storage")),
    youtubeUrl: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    pageCount: v.optional(v.number()),
    fileType: v.optional(v.string()),
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller) throw new Error("User not found");
    if (!caller.agencyId) throw new Error("No agency associated with your profile");

    if ((args.category === "audio" || args.category === "document" || args.category === "image") && !args.storageId) {
      throw new Error("storageId is required for audio, document, and image resources");
    }

    if (args.category === "video" && !args.youtubeUrl) {
      throw new Error("youtubeUrl is required for video resources");
    }
    
    if (args.category === "video" && args.youtubeUrl) {
      if (!args.youtubeUrl.startsWith("https://")) {
        throw new Error("youtubeUrl must be a valid https URL");
      }
      if (!args.youtubeUrl.includes("youtube.com") && !args.youtubeUrl.includes("youtu.be")) {
        throw new Error("youtubeUrl must be a valid YouTube URL");
      }
    }

    const now = Date.now();
    const resourceId = await ctx.db.insert("resources", {
      agencyId: caller.agencyId,
      category: args.category,
      title: args.title,
      description: args.description,
      tag: args.tag,
      shareCount: 0,
      storageId: args.storageId,
      fileType: args.fileType,
      contentType: args.contentType,
      pageCount: args.pageCount,
      durationSeconds: args.durationSeconds,
      youtubeUrl: args.youtubeUrl,
      createdByUserId: caller._id,
      createdAt: now,
      updatedAt: now,
    });

    return resourceId;
  },
});
