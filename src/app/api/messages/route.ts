import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const requestSchema = z.object({
    message: z.string(),
    conversationId: z.string(),
});


export async function POST(req: Request) {
    const { userId } = await auth()

    if (!userId)
        return NextResponse.json({
            error: "Unauthorized",
        }, { status: 401 })


    const convexInternalKey = process.env.CONVEX_INTERNAL_KEY;

    if (!convexInternalKey)
        return NextResponse.json({
            error: "Internal key not found",
        }, { status: 500 })

    const body = await req.json();

    const { message, conversationId } = requestSchema.parse(body);

    const conversation = await convex.query(api.system.getConversationById, { id: conversationId as Id<"conversations">, internalKey: convexInternalKey })


    if (!conversation)
        return NextResponse.json({
            error: "Conversation not found",
        }, { status: 404 })

    const projectId = conversation.projectId;

    await convex.mutation(api.system.createMessage, {
        projectId: projectId as Id<"projects">,
        conversationId: conversationId as Id<"conversations">,
        context: message,
        role: "user",
        internalKey: convexInternalKey
    })

    const assistantMessageId = await convex.mutation(api.system.createMessage, {
        projectId: projectId as Id<"projects">,
        conversationId: conversationId as Id<"conversations">,
        context: "",
        status: "processing",
        role: "assistant",
        internalKey: convexInternalKey
    })

    return NextResponse.json({
        messageId: assistantMessageId,
        success: true,
        eventId: 0
    })
}


