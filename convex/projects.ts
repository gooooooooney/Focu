import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        name: v.string()
    },
    async handler(ctx, args_0) {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }
        await ctx.db.insert("projects", {
            name: args_0.name,
            ownerId: identity.subject
        })
    },
})

export const get = query({
    args: {
        id: v.string()
    },
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            return []
        }
        return await ctx.db
        .query("projects")
        .withIndex("by_owner", q => q.eq("ownerId", identity.subject))
        .collect()
    },
})
