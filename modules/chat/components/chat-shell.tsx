"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import type { CurrentUser } from "@/modules/authentication/actions";
import ChatSidebar from "@/modules/chat/components/chat-sidebar";

type ChatShellProps = {
  user: CurrentUser;
  chats?: {
    id: string;
    title?: string | null;
    createdAt: string | Date;
    messages?: { content?: string | null }[];
  }[];
  children: React.ReactNode;
};

const ChatShell = ({ user, chats, children }: ChatShellProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1536px)");

    const updateSidebarState = () => {
      setIsSidebarCollapsed(!mediaQuery.matches);
    };

    updateSidebarState();
    mediaQuery.addEventListener("change", updateSidebarState);

    return () => {
      mediaQuery.removeEventListener("change", updateSidebarState);
    };
  }, []);

  return (
    <div className="h-dvh p-0 md:p-3 lg:p-4">
      <div className="mx-auto flex h-full w-full max-w-[1600px] overflow-hidden bg-background/80 backdrop-blur-xl md:rounded-[1.75rem] md:border md:border-border/60 md:shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
        <ChatSidebar
          chats={chats}
          isCollapsed={isSidebarCollapsed}
          user={user}
        />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() =>
              setIsSidebarCollapsed((current) => !current)
            }
          />
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default ChatShell;
