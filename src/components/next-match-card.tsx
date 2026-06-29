"use client";

import { CalendarDays, Clock } from "lucide-react";

import { TeamLogo } from "@/components/team-logo";
import { useLiveState } from "@/hooks/use-live-state";

export function NextMatchCard() {
  const nextMatch = useLiveState((store) => store.state?.nextMatch);

  if (!nextMatch) return null;

  const teamOneName = nextMatch.teamOne?.name || "Team 1";
  const teamTwoName = nextMatch.teamTwo?.name || "Team 2";

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
        Next Match
      </h2>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex min-w-0 flex-col items-center gap-3 text-center">
          <TeamLogo src={nextMatch.teamOne?.logoUrl} name={teamOneName} />
          <p className="w-full truncate text-sm font-bold text-zinc-950 dark:text-white sm:text-lg">
            {teamOneName}
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-black text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          VS
        </div>
        <div className="flex min-w-0 flex-col items-center gap-3 text-center">
          <TeamLogo src={nextMatch.teamTwo?.logoUrl} name={teamTwoName} />
          <p className="w-full truncate text-sm font-bold text-zinc-950 dark:text-white sm:text-lg">
            {teamTwoName}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} />
          <span>{nextMatch.matchDate || "Date to be announced"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{nextMatch.matchTime || "Time to be announced"}</span>
        </div>
      </div>
    </section>
  );
}
