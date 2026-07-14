"use client";

import { motion } from "motion/react";
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
    <motion.div
      className="w-full px-0"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-background/80 shadow-[0_16px_40px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <Textarea
            value={message}
            onChange={handleChange}
            placeholder="Type your message here..."
            className="min-h-[76px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3.5 text-sm leading-6 focus-visible:ring-0 focus-visible:ring-offset-0 sm:px-5 sm:py-4 sm:text-base sm:leading-7"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
          />

          <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              {isPending ? (
                <Spinner />
              ) : (
                <ModelSelector
                  models={modelList}
                  selectedModelId={activeModelId}
                  onModelSelect={setSelectedModel}
                  className="ml-0"
                />
              )}
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                type="submit"
                disabled={!message.trim()}
                size="sm"
                variant={message.trim() ? "default" : "ghost"}
                className="h-9 w-9 rounded-full p-0 shadow-sm"
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
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatMessageForm;
