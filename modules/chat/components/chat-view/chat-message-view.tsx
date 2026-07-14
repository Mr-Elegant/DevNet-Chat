"use client";

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

  const handleMessageSelect = (message: string) => {
    setMessage(message);
  };

  const handleMessageChange = (value: string = "") => {
    setMessage(value);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-10">
      <ChatWelcomeTabs
        userName={user?.name}
        onMessageSelect={handleMessageSelect}
      />
      <ChatMessageForm message={message} onMessageChange={handleMessageChange} />
    </div>
  );
};

export default ChatMessageView;
