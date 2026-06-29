"use client";

import { CalendarDays, Clock, Trash2 } from "lucide-react";

import { TeamLogo } from "@/components/team-logo";


import type { UpcomingMatch, PastMatch } from "@/types/match";


function formatDateTime(match: { matchStartAt?: string | null }) {


  if (!match.matchStartAt) return { date: "TBA", time: "TBA" };
  const d = new Date(match.matchStartAt);
  if (!Number.isFinite(d.getTime())) return { date: "TBA", time: "TBA" };
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}




export function UpcomingMatchList({
  matches,
  title,
  showDelete,
  onDelete,
}: {
  matches: UpcomingMatch[] | PastMatch[];
  title: string;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}) {
  if (!matches || matches.length === 0) return null;

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <h2 className="mb-5 text-lg font-bold text-zinc-950 dark:text-white">{title}</h2>

      <div className="space-y-4">
        {matches.map((m) => {
          // upcoming: matchStartAt
          const { date, time } = formatDateTime(m as UpcomingMatch);
          const teamOneName = (m.teamOne?.name ?? "Team 1") as string;
          const teamTwoName = (m.teamTwo?.name ?? "Team 2") as string;


          return (
            <div
              key={m.id}
              className="grid gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                  <TeamLogo
                    src={("teamOne" in m ? m.teamOne?.logoUrl : undefined) as string | undefined}

                    name={teamOneName}
                    size={28}
                  />
                  <p className="w-full truncate text-sm font-bold text-zinc-950 dark:text-white">
                    {teamOneName}
                  </p>
                </div>

                <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-black text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  VS
                </div>

                <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                  <TeamLogo
                    src={(m.teamTwo?.logoUrl ?? undefined) as string | undefined}
                    name={teamTwoName}
                    size={28}
                  />

                  <p className="w-full truncate text-sm font-bold text-zinc-950 dark:text-white">
                    {teamTwoName}
                  </p>
                </div>
              </div>

              {"homeScore" in m && "awayScore" in m ? (

                <div className="flex items-center justify-center gap-3 text-sm font-black text-zinc-950 dark:text-white">
                  <span>{(m as PastMatch).homeScore}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">-</span>
                  <span>{(m as PastMatch).awayScore}</span>

                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{time}</span>
                </div>
              </div>

              {showDelete ? (
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/30"
                    type="button"
                    onClick={() => onDelete?.(m.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

