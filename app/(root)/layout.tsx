import Header from '@/components/header';
import { requireAuth } from '@/modules/authentication/actions';
import { getAllChats } from '@/modules/chat/actions';
import ChatSidebar from '@/modules/chat/components/chat-sidebar';
import type { CurrentUser } from '@/modules/authentication/actions';
import React from 'react'

const Layout = async ({children}: {children: React.ReactNode}) => {
  const session = await requireAuth();
  const sidebarUser: CurrentUser = session?.user
    ? {
        ...session.user,
        image: session.user.image ?? null,
        createdAt: session.user.createdAt.toISOString(),
        updatedAt: session.user.updatedAt.toISOString(),
      }
    : null;

  const {data: chats} = await getAllChats()

  return (
    <div className="h-dvh p-0 md:p-4">
      <div className="flex h-full overflow-hidden bg-background/80 backdrop-blur-xl md:rounded-[2rem] md:border md:border-border/60 md:shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
        <ChatSidebar user={sidebarUser} chats={chats}/>
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <div className="min-h-0 flex-1 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
