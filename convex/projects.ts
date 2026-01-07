import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";

export const create = mutation({
    args: {
        name: v.string()
    },
    async handler(ctx, args_0) {
        const identity = await verifyAuth(ctx)
        const projectId = await ctx.db.insert("projects", {
            name: args_0.name,
            updatedAt: Date.now(),
            ownerId: identity.subject
        })
        return projectId
    },
})

export const getPartial = query({
    args: {
        limit: v.number()
    },
    async handler(ctx, arg) {
        const identity = await verifyAuth(ctx)

        return await ctx.db
            .query("projects")
            .withIndex("by_owner", q => q.eq("ownerId", identity.subject))
            .order("desc")
            .take(arg.limit)
    },
})

export const get = query({
    args: {

    },
    async handler(ctx) {
        const identity = await verifyAuth(ctx)
        return await ctx.db
            .query("projects")
            .withIndex("by_owner", q => q.eq("ownerId", identity.subject))
            .order("desc")
            .collect()
    },
})
