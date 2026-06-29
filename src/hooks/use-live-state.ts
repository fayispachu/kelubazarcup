"use client";

import { create } from "zustand";

import type { PublicState } from "@/types/match";

type LiveStateStore = {
  state: PublicState | null;
  isRefreshing: boolean;
  setState: (state: PublicState) => void;
  refresh: () => Promise<void>;
};

export const useLiveState = create<LiveStateStore>((set) => ({
  state: null,
  isRefreshing: false,
  setState: (state) => set({ state }),
  refresh: async () => {
    set({ isRefreshing: true });
    try {
      const response = await fetch("/api/public/state", { cache: "no-store" });
      if (!response.ok) return;
      const state = (await response.json()) as PublicState;
      set({ state });
    } finally {
      set({ isRefreshing: false });
    }
  },
}));
