"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isToday, isWithinInterval, isYesterday, subDays } from "date-fns";
import {
  EllipsisIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  Trash,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import UserButton from "@/modules/authentication/components/user-button";
import type { CurrentUser } from "@/modules/authentication/actions";
import { cn } from "@/lib/utils";
import DeleteChatModal from "@/components/delete-chat-modal";

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
  user?: CurrentUser | null;
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
    <motion.div
      layout
      className={cn(
        "overflow-hidden rounded-xl border border-transparent text-sm text-sidebar-foreground transition-colors hover:border-border/70 hover:bg-sidebar-accent/70",
        isActive && "border-border/70 bg-sidebar-accent shadow-sm",
      )}
      initial={{ opacity: 1, height: "auto", y: 0 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{
        opacity: 0,
        height: 0,
        y: -8,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <Link href={`/chat/${chat.id}`} className="min-w-0 flex-1">
          <span className="block truncate font-medium">{chat.title}</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent text-sidebar-foreground/70 transition-colors hover:border-border/60 hover:bg-background/70 hover:text-sidebar-foreground"
            type="button"
          >
            <EllipsisIcon className="h-4 w-4" />
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
    </motion.div>
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
    <motion.div layout className="mb-5">
      <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={chat.id === activeChatId}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function SidebarPanel({ user, chats = [] }: ChatSidebarProps) {
  const pathname = usePathname();
  const activeChatId = pathname?.startsWith("/chat/")
    ? pathname.split("/")[2]
    : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [deletedChatIds, setDeletedChatIds] = useState<string[]>([]);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const visibleChats = useMemo(
    () => chats.filter((chat) => !deletedChatIds.includes(chat.id)),
    [chats, deletedChatIds],
  );

  const filteredChats = useMemo(() => {
    if (!deferredSearchQuery.trim()) return visibleChats;

    const query = deferredSearchQuery.toLowerCase();

    return visibleChats.filter(
      (chat) =>
        chat.title?.toLowerCase().includes(query) ||
        chat.messages?.some((message) =>
          message.content?.toLowerCase().includes(query),
        ),
    );
  }, [visibleChats, deferredSearchQuery]);

  const groupedChats = useMemo(
    () => groupChatsByDate(filteredChats),
    [filteredChats],
  );

  const handleDeleteRequest = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsModalOpen(true);
  };

  const handleOptimisticDelete = (chatId: string) => {
    setDeletedChatIds((currentIds) =>
      currentIds.includes(chatId) ? currentIds : [...currentIds, chatId],
    );

    return () => {
      setDeletedChatIds((currentIds) =>
        currentIds.filter((currentChatId) => currentChatId !== chatId),
      );
    };
  };

  const handleDeleteClose = (open: boolean) => {
    setIsModalOpen(open);

    if (!open) {
      setSelectedChatId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar/90 text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border/70 px-4 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sidebar-border/70 bg-background/70 shadow-sm">
          <Image src="/devchat.svg" alt="logo" width={28} height={28} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">DevChat</p>
          <p className="truncate text-xs text-sidebar-foreground/70">
            Fast, focused AI threads
          </p>
        </div>
      </div>

      <div className="p-4">
        <Link
          href="/"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Chat</span>
        </Link>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
          <Input
            placeholder="Search your threads..."
            className="h-11 rounded-xl border-sidebar-border/70 bg-background/70 pr-8 pl-9 shadow-sm backdrop-blur"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/50 hover:text-sidebar-foreground"
            >
              x
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredChats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sidebar-border/70 px-4 py-8 text-center text-sm text-sidebar-foreground/60">
            {searchQuery ? "No chats found" : "No chats yet"}
          </div>
        ) : (
          DATE_GROUP.map((group) => (
            <ChatGroup
              key={group.key}
              label={group.label}
              chats={groupedChats[group.key]}
              activeChatId={activeChatId}
              onDelete={handleDeleteRequest}
            />
          ))
        )}
      </div>

      <div className="border-t border-sidebar-border/70 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-background/70 px-3 py-3 shadow-sm">
          <UserButton user={user ?? null} />
          <span className="flex-1 truncate text-sm text-sidebar-foreground">
            {user?.email}
          </span>
        </div>
      </div>
      {selectedChatId && (
        <DeleteChatModal
          chatId={selectedChatId}
          isModalOpen={isModalOpen}
          setIsModalOpen={handleDeleteClose}
          onOptimisticDelete={handleOptimisticDelete}
        />
      )}
    </div>
  );
}

const ChatSidebar = (props: ChatSidebarProps) => {
  return (
    <>
      <aside className="hidden h-full w-[18rem] shrink-0 border-r border-border/60 bg-sidebar/90 backdrop-blur-xl md:flex">
        <SidebarPanel {...props} />
      </aside>

      <div className="md:hidden">
        <Drawer swipeDirection="left">
          <DrawerTrigger
            aria-label="Open sidebar"
            className="fixed left-3 top-3 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground shadow-lg backdrop-blur-xl"
          >
            <MenuIcon className="h-5 w-5" />
          </DrawerTrigger>
          <DrawerContent
            className="w-[88vw] max-w-sm border-r-0 p-0"
          >
            <SidebarPanel {...props} />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default ChatSidebar;
