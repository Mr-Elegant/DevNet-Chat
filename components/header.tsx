import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ModeToggle } from "./mode-toggle";

type HeaderProps = {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

const Header = ({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 pl-16 pr-4 sm:pr-5 md:px-4 lg:h-16 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-9 w-9 rounded-full border border-border/70 bg-background/70 shadow-sm lg:inline-flex"
            onClick={onToggleSidebar}
            size="icon"
            variant="ghost"
            type="button"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground lg:text-[11px]">
              DevChat
            </div>
            <p className="mt-1.5 truncate text-xs text-muted-foreground lg:mt-2 lg:text-sm">
              Build, explore, and refine ideas with AI.
            </p>
          </div>
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
