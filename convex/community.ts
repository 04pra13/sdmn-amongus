import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- PETITION ---

export const getPetitionStats = query({
    args: {},
    handler: async (ctx) => {
        const current = await ctx.db
            .query("petitions")
            .filter((q) => q.eq(q.field("type"), "current"))
            .first();

        const history = await ctx.db
            .query("petitions")
            .filter((q) => q.eq(q.field("type"), "archive"))
            .order("desc") // default ordering by creation usually, explicitly sort if needed
            .collect();

        return {
            currentCount: current ? current.count : 0,
            history: history,
        };
    },
});

export const incrementPetition = mutation({
    args: {},
    handler: async (ctx) => {
        const current = await ctx.db
            .query("petitions")
            .filter((q) => q.eq(q.field("type"), "current"))
            .first();

        if (current) {
            await ctx.db.patch(current._id, { count: current.count + 1 });
        } else {
            // Start a new one if none exists
            await ctx.db.insert("petitions", {
                type: "current",
                count: 1,
                startDate: Date.now(),
            });
        }
    }
});

// Admin/System function to archive the current petition
// This should be called when a new video is detected
export const archivePetition = mutation({
    args: { videoId: v.string() },
    handler: async (ctx, args) => {
        const current = await ctx.db
            .query("petitions")
            .filter((q) => q.eq(q.field("type"), "current"))
            .first();

        if (current) {
            await ctx.db.patch(current._id, {
                type: "archive",
                endDate: Date.now(),
                videoId: args.videoId
            });
        }
    }
});


// --- COMMENTS ---

export const getComments = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("comments")
            .withIndex("by_timestamp")
            .order("desc")
            .take(50);
    }
});

export const postComment = mutation({
    args: {
        userId: v.string(),
        user: v.string(),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("comments", {
            userId: args.userId,
            user: args.user,
            text: args.text,
            timestamp: Date.now(),
        });
    }
});
