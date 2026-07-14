"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useAIModels } from "../../hooks/use-ai-models";
import ModelSelector from "./model-selector";
import { useCreateChat } from "../../hooks/use-chats";

type ChatMessageFormProps = {
  message: string;
  onMessageChange: (value: string) => void;
};

const ChatMessageForm = ({ message, onMessageChange }: ChatMessageFormProps) => {
  const { data: models, isPending } = useAIModels();
  const [selectedModel, setSelectedModel] = useState("");

  const { mutateAsync, isPending: isChatPending } = useCreateChat();

  const modelList = models?.models ?? [];
  const activeModelId = selectedModel || modelList[0]?.id || "";

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    try {
      await mutateAsync({ content: trimmedMessage, model: selectedModel });
      toast.success("Message sent successfully");
      onMessageChange("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage();
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onMessageChange(e.target.value);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative rounded-2xl border border-border shadow-sm transition-all">
          <Textarea
            value={message}
            onChange={handleChange}
            placeholder="Type your message here..."
            className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
          />

          <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
            <div className="flex items-center gap-1">
              {isPending ? (
                <Spinner />
              ) : (
                <ModelSelector
                  models={modelList}
                  selectedModelId={activeModelId}
                  onModelSelect={setSelectedModel}
                  className="ml-1"
                />
              )}
            </div>

            <Button
              type="submit"
              disabled={!message.trim()}
              size="sm"
              variant={message.trim() ? "default" : "ghost"}
              className="h-8 w-8 rounded-full p-0"
              aria-label="Send message"
              title={
                message.trim() ? "Send message" : "Enter a message to enable"
              }
            >
              {isChatPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatMessageForm;
