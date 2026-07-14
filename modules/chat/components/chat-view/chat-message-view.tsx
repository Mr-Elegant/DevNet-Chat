"use client";

import React, { useState } from 'react'
import ChatWelcomeTabs from './chat-welcome-tabs';
import ChatMessageForm from './chat-message-form';


const ChatMessageView = ({user}) => {
  const [selectedMessage, setSelectedMessage] = useState("");

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
  };

  const handleMessageChange = (value = "") => {
    setSelectedMessage(value);
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen space-y-10'>
        <ChatWelcomeTabs 
          userName={user?.name} 
          onMessageSelect={handleMessageSelect}
        />
        <ChatMessageForm
          key={selectedMessage || "chat-message-form"}
          initialMessage={selectedMessage}
          onMessageChange={handleMessageChange}
        />
    </div>
  )
}

export default ChatMessageView
