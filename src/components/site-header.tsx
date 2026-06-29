"use client";

import Link from "next/link";

import { LiveBadge } from "@/components/live-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLiveState } from "@/hooks/use-live-state";

export function SiteHeader({ isLive }: { isLive: boolean }) {
  const liveState = useLiveState((store) => store.state?.liveMatch.isLive);

  return (
    <header className="border-b border-zinc-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Kelubazar Cup
          </p>
          <h1 className="truncate text-xl font-bold text-zinc-950 dark:text-white sm:text-2xl">
            Kelubazar Cup Live
          </h1>
        </Link>
        <div className="flex items-center gap-3">
          <LiveBadge active={liveState ?? isLive} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
