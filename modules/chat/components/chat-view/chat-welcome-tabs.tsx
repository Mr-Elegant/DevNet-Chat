"use client"

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Sparkles, Newspaper, Code, GraduationCap} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


const CHAT_TAB_MESSAGE = [
  {
    tabName: "Create",
    icon: <Sparkles className="h-4 w-4" />,
    messages: [
      "Write a short story about a robot discovering emotions",
      "Help me outline a sci-fi novel set in a post-apocalyptic world",
      "Create a character profile for a complex villain with sympathetic motives",
      "Give me 5 creative writing prompts for flash fiction",
    ],
  },
  {
    tabName: "Explore",
    icon: <Newspaper className="h-4 w-4" />,
    messages: [
      "Good books for fans of Rick Rubin",
      "Countries ranked by number of corgis",
      "Most successful companies in the world",
      "How much does Claude cost?",
    ],
  },
  {
    tabName: "Code",
    icon: <Code className="h-4 w-4" />,
    messages: [
      "Write code to invert a binary search tree in Python",
      "What is the difference between Promise.all and Promise.allSettled?",
      "Explain React's useEffect cleanup function",
      "Best practices for error handling in async/await",
    ],
  },
  {
    tabName: "Learn",
    icon: <GraduationCap className="h-4 w-4" />,
    messages: [
      "Beginner's guide to TypeScript",
      "Explain the CAP theorem in distributed systems",
      "Why is AI so expensive?",
      "Are black holes real?",
    ],
  },
];

type ChatWelcomeTabsProps = {
  userName?: string;
  onMessageSelect: (message: string) => void;
};

const ChatWelcomeTabs = ({
  userName = "Preet Karwal",
  onMessageSelect,
}: ChatWelcomeTabsProps) => {

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CHAT_TAB_MESSAGE.map((tab, index) => (
          <Button
            key={tab.tabName}
            type="button"
            variant={activeTab === index ? "default" : "secondary"}
            onClick={() => setActiveTab(index)}
            className="h-10 justify-start rounded-full px-4"
          >
            {tab.icon}
            <span className="ml-2">{tab.tabName}</span>
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          className="min-h-[240px] space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {CHAT_TAB_MESSAGE[activeTab].tabName}
            </p>
            <p className="text-xs text-muted-foreground">
              Suggestions for {userName?.split(" ")?.[0] || "you"}
            </p>
          </div>
          {CHAT_TAB_MESSAGE[activeTab].messages.map((message, index) => (
            <motion.div
              key={message}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.16 }}
              className="rounded-2xl border border-transparent px-1 transition-colors hover:border-border/70 hover:bg-muted/40"
            >
              <button
                type="button"
                onClick={() => onMessageSelect(message)}
                className="w-full rounded-2xl px-3 py-3 text-left text-sm leading-6 text-muted-foreground transition-colors duration-300 ease-in-out hover:text-foreground"
              >
                {message}
              </button>
              {index < CHAT_TAB_MESSAGE[activeTab].messages.length - 1 && (
                <Separator />
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ChatWelcomeTabs
