import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";


const validateInternalKey = (key: string) => {
    const internalKey = process.env.CONVEX_INTERNAL_KEY;
    if (!internalKey) {
        throw new Error("Convex internal key not found");
    }

    if (key !== internalKey)
        throw new Error("Invalid internal key");
}

export const getConversationById = query({
    args: {
        id: v.id("conversations"),
        internalKey: v.string(),
    },
    async handler(ctx, args) {
        validateInternalKey(args.internalKey)
        return ctx.db.get("conversations", args.id);
    }
})

export const createMessage = mutation({
    args: {
        internalKey: v.string(),
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        context: v.string(),
        status: v.optional(
            v.union(
                v.literal("processing"),
                v.literal("completed"),
                v.literal("canceled")
            )
        ),
        role: v.union(
            v.literal("user"),
            v.literal("assistant")
        ),
    },
    async handler(ctx, args) {
        validateInternalKey(args.internalKey)
        const {
            conversationId,
            projectId,
            context,
            status,
            role,
        } = args
        const now = Date.now();
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            projectId: args.projectId,
            context: args.context,
            status: args.status,
            role: args.role,
            updatedAt: now,
        });

        await ctx.db.patch("conversations", args.conversationId, {
            updatedAt: now,
        })

        return messageId;
    }
})

export const updateContextMessage = mutation({
    args: {
        internalKey: v.string(),
        messageId: v.id("messages"),
        context: v.string(),
    },
    handler(ctx, args) {
        validateInternalKey(args.internalKey)

        return ctx.db.patch("messages", args.messageId, {
            context: args.context,
            updatedAt: Date.now(),
            status: "completed",
        });
    }
})
