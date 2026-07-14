import { requireAuth } from '@/modules/authentication/actions';
import { getAllChats } from '@/modules/chat/actions';
import ChatShell from '@/modules/chat/components/chat-shell';
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
    <ChatShell user={sidebarUser} chats={chats}>
      {children}
    </ChatShell>
  )
}

export default Layout
