"use client";

import { useEffect } from "react";

import { useLiveState } from "@/hooks/use-live-state";
import type { PublicState } from "@/types/match";

export function LiveStateProvider({
  initialState,
  children,
}: {
  initialState: PublicState;
  children: React.ReactNode;
}) {
  const setState = useLiveState((store) => store.setState);
  const refresh = useLiveState((store) => store.refresh);

  useEffect(() => {
    setState(initialState);
  }, [initialState, setState]);

  useEffect(() => {
    const interval = window.setInterval(refresh, 2000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return children;
}
