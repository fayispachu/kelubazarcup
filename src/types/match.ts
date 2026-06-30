export type Team = {
  id: string;
  name: string;
  logoUrl?: string;
};

export type LiveMatch = {
  id: string;
  streamUrl: string;
  broadcastSessionId: string;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
  homeScore: number;
  awayScore: number;
  minute: string;
  phase?: "NOT_STARTED" | "PAUSED";
  countdownEndsAt?: string | null;
  countdownDurationSeconds?: number;

  isLive: boolean;
  musicEnabled: boolean;
  musicUrl: string;
};

export type NextMatch = {
  id: string;
  teamOne?: Team | null;
  teamTwo?: Team | null;
  matchDate: string;
  matchTime: string;
};

export type UpcomingMatch = {
  id: string;
  teamOne?: Team | null;
  teamTwo?: Team | null;
  matchStartAt?: string | null;
};

export type PastMatch = {
  id: string;
  teamOne?: Team | null;
  teamTwo?: Team | null;
  homeScore: number;
  awayScore: number;
  matchStartAt?: string | null;
  matchEndAt?: string | null;
};

export type PublicState = {
  liveMatch: LiveMatch;
  nextMatch: NextMatch;
  upcomingMatches: UpcomingMatch[];
  pastMatches: PastMatch[];
  teams: Team[];
  updatedAt: string;
};

