import type { PublicState } from "@/types/match";

export type TeamDocument = {
  _id: unknown;
  name?: string;
  logoUrl?: string;
};

export type LiveMatchDocument = {
  _id: unknown;
  streamUrl?: string;
  broadcastSessionId?: string;
  homeTeam?: TeamDocument | null;
  awayTeam?: TeamDocument | null;
  homeScore?: number;
  awayScore?: number;
  minute?: string;

  phase?: "NOT_STARTED" | "PAUSED";
  countdownEndsAt?: string | Date | null;
  countdownDurationSeconds?: number;

  isLive?: boolean;
};


export type NextMatchDocument = {
  _id: unknown;
  teamOne?: TeamDocument | null;
  teamTwo?: TeamDocument | null;
  matchDate?: string;
  matchTime?: string;
};

export type UpcomingMatchDocument = {
  _id: unknown;
  teamOne?: TeamDocument | null;
  teamTwo?: TeamDocument | null;
  matchStartAt?: string | Date | null;
};

export type PastMatchDocument = {
  _id: unknown;
  teamOne?: TeamDocument | null;
  teamTwo?: TeamDocument | null;
  homeScore?: number;
  awayScore?: number;
  matchStartAt?: string | Date | null;
  matchEndAt?: string | Date | null;
};


export function serializeTeam(team?: TeamDocument | null) {
  if (!team) return null;

  return {
    id: String(team._id),
    name: team.name ?? "",
    logoUrl: team.logoUrl ?? "",
  };
}

export function serializeLiveMatch(match: LiveMatchDocument) {
  return {
    id: String(match._id),
    streamUrl: match.streamUrl ?? "",
    broadcastSessionId: match.broadcastSessionId ?? "",
    homeTeam: serializeTeam(match.homeTeam),
    awayTeam: serializeTeam(match.awayTeam),
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
    minute: match.minute ?? "0'",
    phase: match.phase ?? "NOT_STARTED",

    countdownEndsAt: match.countdownEndsAt ? new Date(match.countdownEndsAt).toISOString() : null,
    countdownDurationSeconds: match.countdownDurationSeconds ?? 0,
    isLive: Boolean(match.isLive),
  };
}

export function serializeNextMatch(match: NextMatchDocument) {
  return {
    id: String(match._id),
    teamOne: serializeTeam(match.teamOne),
    teamTwo: serializeTeam(match.teamTwo),
    matchDate: match.matchDate ?? "",
    matchTime: match.matchTime ?? "",
  };
}

export function serializeUpcomingMatch(match: UpcomingMatchDocument) {
  return {
    id: String(match._id),
    teamOne: serializeTeam(match.teamOne ?? null),
    teamTwo: serializeTeam(match.teamTwo ?? null),
    matchStartAt: match.matchStartAt ? new Date(match.matchStartAt).toISOString() : null,
  };
}

export function serializePastMatch(match: PastMatchDocument) {
  return {
    id: String(match._id),
    teamOne: serializeTeam(match.teamOne ?? null),
    teamTwo: serializeTeam(match.teamTwo ?? null),
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
    matchStartAt: match.matchStartAt ? new Date(match.matchStartAt).toISOString() : null,
    matchEndAt: match.matchEndAt ? new Date(match.matchEndAt).toISOString() : null,
  };
}

export function serializePublicState(input: {
  liveMatch: LiveMatchDocument;
  nextMatch: NextMatchDocument;
  upcomingMatches: UpcomingMatchDocument[];
  pastMatches: PastMatchDocument[];
  teams: TeamDocument[];
}): PublicState {
  return {
    liveMatch: serializeLiveMatch(input.liveMatch),
    nextMatch: serializeNextMatch(input.nextMatch),
    upcomingMatches: input.upcomingMatches.map((m) => serializeUpcomingMatch(m)),
    pastMatches: input.pastMatches.map((m) => serializePastMatch(m)),
    teams: input.teams.map((team) => serializeTeam(team)!),
    updatedAt: new Date().toISOString(),
  };
}

