"use client";

import { motion } from "motion/react";
import { useState } from "react";
import ChatWelcomeTabs from './chat-welcome-tabs';
import ChatMessageForm from './chat-message-form';

type ChatMessageViewProps = {
  user?: {
    name?: string | null;
  } | null;
};

const ChatMessageView = ({ user }: ChatMessageViewProps) => {
  const [message, setMessage] = useState("");
  const displayName = user?.name?.split(" ")?.[0] || "there";

  const handleMessageSelect = (message: string) => {
    setMessage(message);
  };

  const handleMessageChange = (value: string = "") => {
    setMessage(value);
  };

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/40 blur-3xl dark:bg-primary/10" />
      </div>

      <motion.div
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur">
              AI workspace
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              How can I help you, {displayName}?
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Start with a suggestion or type your own prompt. The interface is built to stay readable, fast, and comfortable on every screen.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Ideas", "Research", "Code", "Drafts"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-sm text-muted-foreground shadow-sm backdrop-blur"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-background/75 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
            <ChatWelcomeTabs
              userName={user?.name ?? undefined}
              onMessageSelect={handleMessageSelect}
            />
            <div className="mt-6">
              <ChatMessageForm
                message={message}
                onMessageChange={handleMessageChange}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatMessageView;
