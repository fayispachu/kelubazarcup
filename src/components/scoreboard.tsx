"use client";

import { LiveBadge } from "@/components/live-badge";
import { TeamLogo } from "@/components/team-logo";
import { useLiveState } from "@/hooks/use-live-state";

function formatCountdown(countdownEndsAt: string | null | undefined) {
  if (!countdownEndsAt) {
    return "00:00";
  }


  const endsAtMs = new Date(countdownEndsAt).getTime();
  if (!Number.isFinite(endsAtMs)) return "00:00";

  const diffMs = Math.max(0, endsAtMs - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;

  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function Scoreboard() {
  const liveMatch = useLiveState((store) => store.state?.liveMatch);

  if (!liveMatch) return null;

  const homeName = liveMatch.homeTeam?.name || "Home";
  const awayName = liveMatch.awayTeam?.name || "Away";

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          Live Scoreboard
        </h2>
        <LiveBadge active={liveMatch.isLive} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <TeamLogo src={liveMatch.homeTeam?.logoUrl} name={homeName} />
          <p className="min-w-0 truncate text-base font-bold text-zinc-950 dark:text-white sm:text-xl">
            {homeName}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-3 rounded-md bg-zinc-950 px-4 py-3 text-3xl font-black tabular-nums text-white dark:bg-white dark:text-zinc-950 sm:text-5xl">
            <span>{liveMatch.homeScore}</span>
            <span className="text-zinc-500">-</span>
            <span>{liveMatch.awayScore}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-red-600">
            {formatCountdown(liveMatch.countdownEndsAt)}
          </p>
        </div>

        <div className="flex min-w-0 flex-col-reverse items-center gap-3 text-center sm:flex-row sm:justify-end sm:text-right">
          <p className="min-w-0 truncate text-base font-bold text-zinc-950 dark:text-white sm:text-xl">
            {awayName}
          </p>
          <TeamLogo src={liveMatch.awayTeam?.logoUrl} name={awayName} />
        </div>
      </div>
    </section>
  );
}
