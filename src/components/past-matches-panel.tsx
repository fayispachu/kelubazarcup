"use client";

import { useMemo } from "react";

import { UpcomingMatchList } from "@/components/upcoming-match-list";
import { useLiveState } from "@/hooks/use-live-state";

export function PastMatchesPanel() {
  const state = useLiveState((store) => store.state);
  const pastMatches = useMemo(() => state?.pastMatches ?? [], [state?.pastMatches]);

  if (pastMatches.length === 0) return null;

  return <UpcomingMatchList matches={pastMatches} title="Past Matches" />;
}
