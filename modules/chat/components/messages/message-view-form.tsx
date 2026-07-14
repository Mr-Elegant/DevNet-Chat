"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useSearchParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useGetChatById } from "../../hooks/use-chats";
import { useAIModels } from "../../hooks/use-ai-models";
import { Spinner } from "@/components/ui/spinner";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import ModelSelector from "../chat-view/model-selector";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { toast } from "sonner";

function parseMessageToUI(msg) {
  const basePart = { type: "text", text: msg.content };

  try {
    const parts = JSON.parse(msg.content);

    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase(),
      parts: Array.isArray(parts) ? parts : [basePart],
      createdAt: msg.createdAt,
    };
  } catch {
    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase(),
      parts: [basePart],
      createdAt: msg.createdAt,
    };
  }
}

function MessagePart({ part, messageId, partIndex, role }: {oart: MessagePartShape, messageId: string, partIndex: number, role: UIMessage["role"], isStreaming: boolean}) {
  const key = `${messageId}-${partIndex}`;

  if (part.type === "text") {
    return (
      <Message from={role} key={key}>
        <MessageContent>
          <MessageResponse>{part.text}</MessageResponse>
        </MessageContent>
      </Message>
    );
  }

  if (part.type === "reasoning") {
    return (
      <Reasoning
        className="max-w-2xl px-4 py-4 border border-muted rounded-md bg-muted/50"
        key={key}
      >
        <ReasoningTrigger />

        <ReasoningContent className="mt-2 italic font-light text-muted-foreground">
          {part.text ?? "No reasoning content available."}
        </ReasoningContent>
      </Reasoning>
    );
  }

  if (part.type === "step-start" && partIndex > 0) {
    return (
      <div key={key} className="my-4 text-gray-500">
        <hr className="border-gray-300" />
      </div>
    );
  }

  return null;
}

const MessageViewWithForm = ({ chatId }: { chatId: string }) => {
  const {data:chatData , isPending } = useGetChatById(chatId);

  if(isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  if(!chatData?.success || !chatData?.data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
          Chat not Found
      </div>
    )
  }

  const rawMessages = (chatData.data.messages ?? [])
  const initialMessages: UIMessage[] = rawMessages.filter((m)=> m?.id && m?.content?.trim()).map(parseMessageToUI);

  return (
    <ChatView chatId={chatId} initialMessages={initialMessages} initialModel={chatData.data.model} />
  )


}


const ChatView = ({chatId, initialMessages, initialModel}: {chatId: string, initialMessages: UIMessage[], initialModel: string | null}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoTrigger = searchParams.get("autoTrigger") === "true";
  const hasAutoTriggered = useRef(false);

  const [selectedModel, setSelectedModel] = useState<string | null>(initialModel)
  const {data: modelsData, isPending: isModelLoading} = useAIModels();


  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    [],
  );

  const { messages, status, sendMessage, regenerate, stop, error } = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
    onError: (err) => {
      console.log("chat error", err);
      toast.error(err.message);
    },
  });

    const isBuzy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (hasAutoTriggered.current) return;
    if (!shouldAutoTrigger) return;
    if (!selectedModel) return;
    if (messages.length === 0) return;
    if (messages.at(-1)?.role !== "user") return;

    hasAutoTriggered.current = true;

    regenerate({
      body: {
        chatId,
        model: selectedModel,
        skipUserMessage: true,
      },
    }).catch((err) => {
      console.error("Auto-trigger failed:", err);
      toast.error("Failed to generate response");
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("autoTrigger");
    const query = params.toString();
    router.replace(`/chat/${chatId}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }, [
    shouldAutoTrigger,
    selectedModel,
    messages,
    chatId,
    regenerate,
    router,
    searchParams,
  ]);


  const handleSubmit = async(message: PromptInputMessage) => {
    const text = message.text?.trim();
    if(!text) return;
    if(!selectedModel){
      toast.error("Please select a model first")
    }
    if(isBuzy) return;

    try{
      await sendMessage({text}, {
        body: {
          chatId,
          model: selectedModel,
          skipUserMessage: false
        }
      })
    } catch (error){
        console.error("Send message failed:", error);
        toast.error("Failed to send message");
    }
  }

  return (
    <div className="relative h-[calc(100dvh-4rem)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-border/70 bg-background/75 px-4 py-3 shadow-lg backdrop-blur-xl">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Conversation
            </p>
            <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">
              {selectedModel || initialModel || "Select a model to begin"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isBuzy && (
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
                <Spinner className="h-4 w-4" />
                <span>Generating</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <Conversation className="h-full">
            <ConversationContent className="px-4 py-6 sm:px-6 sm:py-8">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Start the conversation"
                  description="Send a message to get started"
                  className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/60"
                />
              ) : (
                messages.map((message) => (
                  <Fragment key={message.id}>
                    {message.parts.map((part, i) => (
                      <MessagePart
                        key={`${message.id}-${i}`}
                        part={part as MessagePartShape}
                        messageId={message.id}
                        partIndex={i}
                        role={message.role}
                        isStreaming={
                          isBuzy && messages.at(-1) && i === message.parts.length - 1
                        }
                      />
                    ))}
                  </Fragment>
                ))
              )}

              {status === "submitted" && (
                <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-muted-foreground">
                  <Spinner />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error.message || "Something went wrong"}
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>

        <PromptInput onSubmit={handleSubmit} className="mt-0">
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Type your message..."
              disabled={isBuzy}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools className="flex w-full items-center justify-between gap-2">
              <div className="flex-1">
                {isModelLoading ? (
                  <Spinner />
                ) : (
                  <ModelSelector
                    models={modelsData?.models ?? []}
                    selectedModelId={selectedModel}
                    onModelSelect={setSelectedModel}
                    className=""
                  />
                )}
              </div>

              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )


}







export default MessageViewWithForm;
