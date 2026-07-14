"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isToday, isWithinInterval, isYesterday, subDays } from "date-fns";
import { EllipsisIcon, PlusIcon, SearchIcon, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import UserButton from "@/modules/authentication/components/user-button";
import { deleteChat } from "@/modules/chat/actions";
import { cn } from "@/lib/utils";

type ChatMessage = {
  content?: string | null;
};

type Chat = {
  id: string;
  title?: string | null;
  createdAt: string | Date;
  messages?: ChatMessage[];
};

type ChatGroups = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  older: Chat[];
};

type ChatSidebarProps = {
  user?: {
    email?: string | null;
  } | null;
  chats?: Chat[];
};

function groupChatsByDate(chats: Chat[]) {
  const groups: ChatGroups = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  const now = new Date();

  chats.forEach((chat) => {
    const date = new Date(chat.createdAt);

    if (isToday(date)) {
      groups.today.push(chat);
      return;
    }

    if (isYesterday(date)) {
      groups.yesterday.push(chat);
      return;
    }

    if (isWithinInterval(date, { start: subDays(now, 7), end: now })) {
      groups.lastWeek.push(chat);
      return;
    }

    groups.older.push(chat);
  });

  return groups;
}

const DATE_GROUP = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "lastWeek", label: "Last 7 Days" },
  { key: "older", label: "Older" },
] as const;

type ChatItemProps = {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
};

function ChatItem({ chat, isActive, onDelete }: ChatItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent",
      )}
    >
      <Link href={`/chat/${chat.id}`} className="min-w-0 flex-1">
        <span className="block truncate">{chat.title}</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-sidebar-accent-foreground/10"
          >
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex cursor-pointer flex-row gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(chat.id);
            }}
          >
            <Trash className="h-4 w-4 text-red-500" />
            <span className="text-red-500">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type ChatGroupProps = {
  label: string;
  chats: Chat[];
  activeChatId: string | null;
  onDelete: (chatId: string) => void;
};

function ChatGroup({ label, chats, activeChatId, onDelete }: ChatGroupProps) {
  if (chats.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
        {label}
      </div>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

const ChatSidebar = ({ user, chats = [] }: ChatSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const activeChatId = pathname?.startsWith("/chat/")
    ? pathname.split("/")[2]
    : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredChats = useMemo(() => {
    if (!deferredSearchQuery.trim()) return chats;

    const query = deferredSearchQuery.toLowerCase();

    return chats.filter(
      (chat) =>
        chat.title?.toLowerCase().includes(query) ||
        chat.messages?.some((message) =>
          message.content?.toLowerCase().includes(query),
        ),
    );
  }, [chats, deferredSearchQuery]);

  const groupedChats = useMemo(
    () => groupChatsByDate(filteredChats),
    [filteredChats],
  );

  const handleDelete = async (chatId: string) => {
    const result = await deleteChat(chatId);

    setIsModalOpen(true);

    if (result?.success) {
      router.refresh();
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center border-b border-sidebar-border px-4 py-3">
        <Image src="/devchat.svg" alt="logo" width={75} height={75} />
      </div>

      <div className="p-4">
        <Link
          href="/"
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>New Chat</span>
        </Link>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your threads..."
            className="border-sidebar-border bg-sidebar-accent pr-8 pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              x
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {filteredChats.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {searchQuery ? "No chats found" : "No chats yet"}
          </div>
        ) : (
          DATE_GROUP.map((group) => (
            <ChatGroup
              key={group.key}
              label={group.label}
              chats={groupedChats[group.key]}
              activeChatId={activeChatId}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-sidebar-border p-4">
        <UserButton user={user} />
        <span className="flex-1 truncate text-sm text-sidebar-foreground">
          {user?.email}
        </span>
      </div>
    </div>
  );
};

export default ChatSidebar;
