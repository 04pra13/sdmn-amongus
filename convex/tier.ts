import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveTierList = mutation({
    args: {
        userId: v.string(),
        userName: v.string(),
        rankings: v.any(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("tierLists")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                userName: args.userName,
                rankings: args.rankings,
                timestamp: Date.now(),
            });
        } else {
            await ctx.db.insert("tierLists", {
                userId: args.userId,
                userName: args.userName,
                rankings: args.rankings,
                timestamp: Date.now(),
            });
        }
    },
});

export const getUserTierList = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tierLists")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();
    },
});


export const getAggregatedTierList = query({
    args: {},
    handler: async (ctx) => {
        const tierLists = await ctx.db.query("tierLists").collect();

        if (tierLists.length === 0) return {};

        const playerScores: Record<string, { totalScore: number; count: number }> = {};
        const tierWeights: Record<string, number> = {
            S: 5,
            A: 4,
            B: 3,
            C: 2,
            D: 1,
            F: 0,
        };

        tierLists.forEach((list) => {
            const rankings = list.rankings as Record<string, string>;
            for (const [player, tier] of Object.entries(rankings)) {
                if (!playerScores[player]) {
                    playerScores[player] = { totalScore: 0, count: 0 };
                }
                if (tierWeights[tier] !== undefined) {
                    playerScores[player].totalScore += tierWeights[tier];
                    playerScores[player].count += 1;
                }
            }
        });

        const averagedTiers: Record<string, string> = {};
        for (const [player, stats] of Object.entries(playerScores)) {
            const avg = stats.totalScore / stats.count;
            if (avg >= 4.5) averagedTiers[player] = "S";
            else if (avg >= 3.5) averagedTiers[player] = "A";
            else if (avg >= 2.5) averagedTiers[player] = "B";
            else if (avg >= 1.5) averagedTiers[player] = "C";
            else if (avg >= 0.5) averagedTiers[player] = "D";
            else averagedTiers[player] = "F";
        }

        return averagedTiers;
    },
});
