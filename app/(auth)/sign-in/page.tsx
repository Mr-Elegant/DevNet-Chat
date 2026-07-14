"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

const highlights = [
  {
    icon: Sparkles,
    title: "Instant setup",
    description: "Jump straight into prompts, chats, and saved threads.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description: "Your workspace stays tied to your account and chats.",
  },
  {
    icon: WandSparkles,
    title: "Built for momentum",
    description: "A focused layout that keeps the chat experience fast.",
  },
];

export default function SignInPage() {
  const [isSigningIn, setIsSigningIn] = useState<"github" | "google" | null>(
    null,
  );

  const handleSignIn = async (provider: "github" | "google") => {
    try {
      setIsSigningIn(provider);
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } finally {
      setIsSigningIn(null);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-secondary/50 blur-3xl dark:bg-primary/10" />
      </div>

      <motion.div
        className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-background/75 shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:grid lg:grid-cols-[1.1fr_0.9fr]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <section className="flex flex-col justify-between gap-8 p-6 sm:p-10 lg:p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm">
              DevChat
            </div>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                A cleaner place to think, draft, and ship ideas.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Sign in with GitHub to save your chats, keep your workspace in sync,
                and continue every thread from anywhere.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index, duration: 0.2 }}
                >
                  <Card className="h-full border-border/70 bg-background/80 shadow-sm">
                    <CardContent className="space-y-3 p-5">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/60 text-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-sm font-semibold">{item.title}</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">
              Markdown-ready answers
            </span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">
              Saved conversation history
            </span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">
              Fast, focused UI
            </span>
          </div>
        </section>

        <section className="flex items-center justify-center border-t border-border/70 bg-gradient-to-br from-background/90 via-background/70 to-muted/40 p-6 sm:p-10 lg:border-t-0 lg:border-l lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut", delay: 0.06 }}
          >
            <Card className="border-border/70 bg-background/90 shadow-2xl">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/60 shadow-sm">
                    <Image src="/devchat.svg" alt="DevChat logo" width={30} height={30} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Sign in
                    </p>
                    <h2 className="truncate text-xl font-semibold">
                      Welcome back
                    </h2>
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  Use GitHub or Google to get into your workspace and start where
                  you left off.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    className="h-12 rounded-2xl text-base shadow-sm transition-transform hover:-translate-y-0.5"
                    onClick={() => handleSignIn("github")}
                    disabled={isSigningIn !== null}
                  >
                    <Image
                      src="/github.svg"
                      alt="GitHub"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    <span>
                      {isSigningIn === "github"
                        ? "Signing in..."
                        : "Continue with GitHub"}
                    </span>
                    {isSigningIn === null && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 rounded-2xl text-base shadow-sm transition-transform hover:-translate-y-0.5"
                    onClick={() => handleSignIn("google")}
                    disabled={isSigningIn !== null}
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#4285F4_0deg_90deg,#34A853_90deg_180deg,#FBBC05_180deg_270deg,#EA4335_270deg_360deg)] text-[10px] font-bold text-white">
                      G
                    </span>
                    <span>
                      {isSigningIn === "google"
                        ? "Signing in..."
                        : "Continue with Google"}
                    </span>
                    {isSigningIn === null && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="grid gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <p>Keep all your chats synced across devices.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                    <p>Resume previous threads without losing context.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </motion.div>
    </main>
  );
}
