import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    tierLists: defineTable({
        userId: v.string(), // Unique ID (UUID from localStorage)
        userName: v.string(), // Display Name
        rankings: v.any(), // Map of playerId -> tier (S, A, B, etc.)
        timestamp: v.number(),
    }).index("by_user_id", ["userId"]),
    petitions: defineTable({
        type: v.union(v.literal("current"), v.literal("archive")),
        count: v.number(),
        startDate: v.number(),
        endDate: v.optional(v.number()),
        videoId: v.optional(v.string()), // ID/Url of video that closed this petition
    }),
    comments: defineTable({
        userId: v.string(),
        user: v.string(),
        text: v.string(),
        timestamp: v.number(),
    }).index("by_timestamp", ["timestamp"]),
});
