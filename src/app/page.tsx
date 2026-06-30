import { LiveStateProvider } from "@/components/live-state-provider";
import { NextMatchCard } from "@/components/next-match-card";
import { PastMatchesPanel } from "@/components/past-matches-panel";
import { Scoreboard } from "@/components/scoreboard";
import { SiteHeader } from "@/components/site-header";
import { VideoPlayer } from "@/components/video-player";
import { getPublicState } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await getPublicState();

  return (
    <LiveStateProvider initialState={state}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <SiteHeader isLive={state.liveMatch.isLive} />
        <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <VideoPlayer />
            <Scoreboard />
            <PastMatchesPanel />
          </div>
          <aside>
            <NextMatchCard />
          </aside>
        </main>
      </div>
    </LiveStateProvider>
  );
}
