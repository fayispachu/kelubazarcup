"use client";

import { Minus, Plus, Save, Upload } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";

import { AdminBroadcastPanel } from "@/components/admin-broadcast-panel";
import { TeamLogo } from "@/components/team-logo";
import { useLiveState } from "@/hooks/use-live-state";

function fieldClassName() {
  return "h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white";
}

function buttonClassName(variant: "primary" | "secondary" | "danger" = "secondary") {
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60";

  if (variant === "primary") return `${base} bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200`;
  if (variant === "danger") return `${base} bg-red-600 text-white hover:bg-red-700`;
  return `${base} border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800`;
}

export function AdminDashboard() {
  const state = useLiveState((store) => store.state);
  const refresh = useLiveState((store) => store.refresh);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");



  const [liveForm, setLiveForm] = useState({
    streamUrl: "",
    broadcastSessionId: "",
    homeTeam: "",
    awayTeam: "",
    homeScore: 0,
    awayScore: 0,
    minute: "0'", 
    phase: "NOT_STARTED" as "NOT_STARTED" | "PAUSED",

    countdownEndsAt: null as string | null,
    countdownDurationSeconds: 0,
    isLive: false,
  });
  const [nextForm, setNextForm] = useState({
    teamOne: "",
    teamTwo: "",
    matchDate: "",
    matchTime: "",
  });

  const teams = useMemo(() => state?.teams ?? [], [state?.teams]);

  useEffect(() => {
    if (!state) return;

    setLiveForm({
      streamUrl: state.liveMatch.streamUrl,
      broadcastSessionId: state.liveMatch.broadcastSessionId,
      homeTeam: state.liveMatch.homeTeam?.id ?? "",
      awayTeam: state.liveMatch.awayTeam?.id ?? "",
      homeScore: state.liveMatch.homeScore,
      awayScore: state.liveMatch.awayScore,
      minute: state.liveMatch.minute,
    phase: (state.liveMatch.phase ?? "NOT_STARTED") as "NOT_STARTED" | "PAUSED",

      countdownEndsAt: state.liveMatch.countdownEndsAt ?? null,
      countdownDurationSeconds: state.liveMatch.countdownDurationSeconds ?? 0,
      isLive: state.liveMatch.isLive,
    });

    setNextForm({
      teamOne: state.nextMatch.teamOne?.id ?? "",
      teamTwo: state.nextMatch.teamTwo?.id ?? "",
      matchDate: state.nextMatch.matchDate,
      matchTime: state.nextMatch.matchTime,
    });
  }, [state]);

  async function persist(endpoint: string, payload: unknown) {
    setMessage("");
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Update failed" }));
      throw new Error(error.message);
    }

    router.refresh();
    await refresh();
    setMessage("Saved");
  }

  function saveLiveMatch(next = liveForm) {
    startTransition(async () => {
      try {
        await persist("/api/admin/live-match", next);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not save match");
      }
    });
  }

  async function startDirectBroadcast(sessionId: string) {
    const next = {
      ...liveForm,
      streamUrl: "",
      broadcastSessionId: sessionId,
      isLive: true,
    };

    setLiveForm(next);
    await persist("/api/admin/live-match", next);
  }

  async function stopDirectBroadcast() {
    const next = {
      ...liveForm,
      streamUrl: "",
      broadcastSessionId: "",
      isLive: false,
    };

    setLiveForm(next);
    await persist("/api/admin/live-match", next);
  }

  async function finishMatch() {
    setMessage("");

    try {
      const response = await fetch("/api/admin/past-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeam: liveForm.homeTeam,
          awayTeam: liveForm.awayTeam,
          homeScore: liveForm.homeScore,
          awayScore: liveForm.awayScore,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Could not save finished match" }));
        throw new Error(error.message);
      }

      const next = {
        ...liveForm,
        streamUrl: "",
        broadcastSessionId: "",
        phase: "NOT_STARTED" as "NOT_STARTED" | "PAUSED",
        countdownEndsAt: null,
        countdownDurationSeconds: 0,
        isLive: false,
      };

      setLiveForm(next);
      router.refresh();
      await refresh();
      setMessage("Match saved to history");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save finished match");
    }
  }

  function adjustScore(side: "homeScore" | "awayScore", delta: number) {
    const next = {
      ...liveForm,
      [side]: Math.max(0, Number(liveForm[side]) + delta),
    };
    setLiveForm(next);
    saveLiveMatch(next);
  }

  async function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/admin/teams", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Could not save team" }));
      setMessage(error.message);
      return;
    }

    form.reset();
    await refresh();
    setMessage("Team saved");
  }

  function pauseMatch() {
    const next = {
      ...liveForm,
      phase: "PAUSED" as "NOT_STARTED" | "PAUSED",
      countdownDurationSeconds: 0,
      countdownEndsAt: null,
      isLive: liveForm.isLive,
    };


    setLiveForm(next);
    saveLiveMatch(next);
  }

  function saveNextMatch() {
    startTransition(async () => {
      try {
        await persist("/api/admin/next-match", nextForm);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not save next match");
      }
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Admin Control Room</p>
            <h1 className="text-xl font-bold text-zinc-950 dark:text-white">Kelubazar Cup Live</h1>
          </div>
          <button
            className={buttonClassName()}
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <AdminBroadcastPanel
            isLive={liveForm.isLive}
            sessionId={liveForm.broadcastSessionId}
            onStart={startDirectBroadcast}
            onStop={stopDirectBroadcast}
          />

          <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Live Match</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button className={buttonClassName("danger")} type="button" onClick={() => void finishMatch()}>
                  <Save size={16} /> End match
                </button>
                {message ? <p className="text-sm font-semibold text-zinc-500">{message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TeamSelect
                  label="Home team"
                  value={liveForm.homeTeam}
                  onChange={(homeTeam) => {
                    // Prevent “selecting instantly jumps back” by committing immediately.
                    setLiveForm((prev) => ({ ...prev, homeTeam }));
                    saveLiveMatch({ ...liveForm, homeTeam });
                  }}
                  teams={teams}
                />

                <TeamSelect
                  label="Away team"
                  value={liveForm.awayTeam}
                  onChange={(awayTeam) => {
                    setLiveForm((prev) => ({ ...prev, awayTeam }));
                    saveLiveMatch({ ...liveForm, awayTeam });
                  }}
                  teams={teams}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <ScoreControl
                  label="Home score"
                  value={liveForm.homeScore}
                  onMinus={() => adjustScore("homeScore", -1)}
                  onPlus={() => adjustScore("homeScore", 1)}
                />
                <ScoreControl
                  label="Away score"
                  value={liveForm.awayScore}
                  onMinus={() => adjustScore("awayScore", -1)}
                  onPlus={() => adjustScore("awayScore", 1)}
                />
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Countdown</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                    <button
                      className={buttonClassName("danger")}
                      type="button"
                      onClick={pauseMatch}
                      disabled={isPending}
                    >
                      Pause/Stop
                    </button>
                  </div>
                </div>

              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className={buttonClassName("primary")}
                  type="button"
                  onClick={() => saveLiveMatch()}
                  disabled={isPending}
                >
                  <Save size={16} /> Save match
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <h2 className="mb-5 text-lg font-bold text-zinc-950 dark:text-white">Next Match</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeamSelect
                label="Team 1"
                value={nextForm.teamOne}
                onChange={(teamOne) => setNextForm((p) => ({ ...p, teamOne }))}
                teams={teams}
              />

              <TeamSelect
                label="Team 2"
                value={nextForm.teamTwo}
                onChange={(teamTwo) => setNextForm((p) => ({ ...p, teamTwo }))}
                teams={teams}
              />

              <label className="grid gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Match date
                <input
                  className={fieldClassName()}
                  type="date"
                  value={nextForm.matchDate}
                  onChange={(event) => setNextForm({ ...nextForm, matchDate: event.target.value })}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Match time
                <input
                  className={fieldClassName()}
                  type="time"
                  value={nextForm.matchTime}
                  onChange={(event) => setNextForm({ ...nextForm, matchTime: event.target.value })}
                />
              </label>
            </div>
            <button
              className={`${buttonClassName("primary")} mt-5`}
              type="button"
              onClick={saveNextMatch}
              disabled={isPending}
            >
              <Save size={16} /> Save next match
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <h2 className="mb-5 text-lg font-bold text-zinc-950 dark:text-white">Teams</h2>
            <form onSubmit={createTeam} className="grid gap-3">
              <input className={fieldClassName()} name="name" placeholder="Team name" required />
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 px-3 text-sm font-bold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                <Upload size={16} /> Upload logo
                <input className="sr-only" type="file" name="logo" accept="image/*" />
              </label>
              <button className={buttonClassName("primary")} type="submit">
                Save team
              </button>
            </form>
            <div className="mt-5 space-y-3">
              {teams.map((team) => (
                <TeamEditor key={team.id} team={team} onSaved={refresh} />
              ))}
              {teams.length === 0 ? <p className="text-sm text-zinc-500">Add teams before assigning matches.</p> : null}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function TeamSelect({
  label,
  value,
  onChange,
  teams,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  teams: { id: string; name: string; logoUrl?: string }[];
}) {
  const selected = teams.find((t) => t.id === value);

  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
      {label}
      <div className="relative">
        {/* Selected preview with icon */}
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <div className="h-6 w-6">
            <TeamLogo src={selected?.logoUrl} name={selected?.name} size={24} />
          </div>
        </div>

        <select
          className={`${fieldClassName()} pl-14`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function TeamEditor({
  team,
  onSaved,
}: {
  team: { id: string; name: string; logoUrl?: string };
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(team.name);
  const [isSaving, setIsSaving] = useState(false);

  async function updateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    formData.set("id", team.id);
    formData.set("name", name);

    const response = await fetch("/api/admin/teams", {
      method: "PATCH",
      body: formData,
    });

    setIsSaving(false);

    if (response.ok) {
      await onSaved();
    }
  }

  return (
    <form
      onSubmit={updateTeam}
      className="grid gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
    >
      <div className="flex items-center gap-3">
        <TeamLogo src={team.logoUrl} name={team.name} size={40} />
        <input
          className={fieldClassName()}
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label={`${team.name} name`}
        />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 px-3 text-sm font-bold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          <Upload size={16} /> Logo
          <input className="sr-only" type="file" name="logo" accept="image/*" />
        </label>
        <button className={buttonClassName()} type="submit" disabled={isSaving}>
          <Save size={16} />
        </button>
      </div>
    </form>
  );
}

function ScoreControl({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</p>
      <div className="grid grid-cols-[40px_1fr_40px] overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
        <button
          className="flex h-11 items-center justify-center bg-white text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          type="button"
          onClick={onMinus}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={16} />
        </button>
        <div className="flex h-11 items-center justify-center border-x border-zinc-300 bg-zinc-50 text-lg font-black tabular-nums dark:border-zinc-700 dark:bg-zinc-900">
          {value}
        </div>
        <button
          className="flex h-11 items-center justify-center bg-white text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          type="button"
          onClick={onPlus}
          aria-label={`Increase ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

