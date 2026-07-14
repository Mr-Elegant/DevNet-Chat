import React from 'react'
import { ModeToggle } from './mode-toggle'

const Header = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 pl-16 sm:px-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            DevChat
          </div>
          <p className="mt-2 truncate text-sm text-muted-foreground">
            Build, explore, and refine ideas with AI.
          </p>
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
