"use client";

import { PlayCircle } from "lucide-react";

import { DirectLivePlayer } from "@/components/direct-live-player";
import { useLiveState } from "@/hooks/use-live-state";
// a
export function VideoPlayer() {
  const liveMatch = useLiveState((store) => store.state?.liveMatch);
  const hasDirectBroadcast = Boolean(liveMatch?.isLive && liveMatch.broadcastSessionId);

  return (
    <section className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-950 shadow-sm dark:border-zinc-800">
      <div className="aspect-video w-full">
        {hasDirectBroadcast ? (
          <DirectLivePlayer
            sessionId={liveMatch!.broadcastSessionId}
            isLive={liveMatch!.isLive}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-white">
            <PlayCircle size={48} className="text-zinc-500" />
            <div>
              <p className="text-xl font-semibold">Live stream will start soon</p>
              <p className="mt-2 text-sm text-zinc-400">
                The direct broadcast will appear here when the admin goes live.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
