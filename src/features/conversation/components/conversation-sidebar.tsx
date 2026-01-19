import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Id } from "../../../../convex/_generated/dataModel";
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputMessage, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
import { IconCopy, IconHistory, IconLoader2, IconPlus } from "@tabler/icons-react";
import ky from "ky";
import { Button } from "@/components/ui/button";
import { useConversations, useCreateConversation, useConversation, useMessages } from "../hooks/use-conversations";
import { DEFAULT_CONVERSATION_TITLE } from "../../../../convex/constants";
import { useState } from "react";
import { toast } from "sonner";


export const ConversationSidebar = ({ projectId }: { projectId: Id<"projects"> }) => {

    const [input, setInput] = useState("");
    const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
    const conversations = useConversations(projectId);

    const activeConversationId = selectedConversationId ?? conversations?.[0]?._id
        ?? null

    const createConversation = useCreateConversation();
    const activeCnversation = useConversation(activeConversationId);
    const cnversationMessages = useMessages(activeConversationId);

    const isProcessing = cnversationMessages?.some((message) => message.status === "processing");

    const handleCreateConversation = async () => {
        try {
            const newConversationId = await createConversation({
                projectId,
                title: DEFAULT_CONVERSATION_TITLE,
            });
            setSelectedConversationId(newConversationId);
            return newConversationId;
        } catch (error) {
            toast.error("Failed to create conversation");
            return null
        }
    };

    const handleSubmit = async (message: PromptInputMessage) => {
        if (isProcessing && !message.text) {
            setInput("");
            return;
        }

        let conversationId: Id<"conversations"> | null = activeConversationId;

        if (!conversationId) {
            conversationId = await handleCreateConversation();
            if (!conversationId) {
                return;
            }
        }
        try {
            await ky.post(`/api/messages`, {
                json: {
                    message: message.text,
                    conversationId,
                },
            });


        } catch (error) {
            toast.error("Failed to submit message");
        }
        setInput("");

    };

    return (
        <div className="flex flex-col gap-4 h-full bg-sidebar">
            <div className="h-8.75 flex items-center justify-between border-b">
                <div className="text-sm truncate pl-3">
                    {
                        activeCnversation?.title || DEFAULT_CONVERSATION_TITLE
                    }
                </div>
                <div className="flex items-center px-1 gap-1">
                    <Button
                        variant="highlight"
                        size="icon-xs"
                    >
                        <IconHistory className="size-3.5" />
                    </Button>
                    <Button
                        onClick={handleCreateConversation}
                        variant="highlight"
                        size="icon-xs"
                    >
                        <IconPlus className="size-3.5" />
                    </Button>
                </div>

            </div>
            <Conversation className="flex-1">
                <ConversationContent>
                    {
                        cnversationMessages?.map((message, index) => (
                            <Message
                                key={message._id}
                                from={message.role}

                            >
                                <MessageContent>
                                    {
                                        message.status === "processing" ? (
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <IconLoader2 className="size-4 animate-spin" />
                                                <span>Thinking...</span>
                                            </div>
                                        ) : (
                                            <MessageResponse>
                                                {message.context}
                                            </MessageResponse>
                                        )
                                    }
                                </MessageContent>
                                {
                                    message.status === "completed"
                                    && message.role === "assistant"
                                    && index === cnversationMessages.length - 1
                                    && (
                                        <MessageActions>
                                            <MessageAction
                                                label="Copy"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(message.context);
                                                }}
                                            >
                                                <IconCopy className="size-3" />
                                            </MessageAction>
                                        </MessageActions>
                                    )
                                }

                            </Message>
                        ))
                    }
                    <ConversationScrollButton />
                </ConversationContent>

            </Conversation>
            <div className="p-3">
                <PromptInput
                    onSubmit={handleSubmit}
                    className="mt-2"
                >
                    <PromptInputBody>
                        <PromptInputTextarea
                            placeholder="What would you like to know?"
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                            disabled={isProcessing}
                        />
                    </PromptInputBody>
                    <PromptInputFooter>
                        <PromptInputTools />
                        <PromptInputSubmit
                            disabled={!isProcessing && !input}
                            status={isProcessing ? "streaming" : undefined}
                        />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    );
};
