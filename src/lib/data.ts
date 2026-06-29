import { connectDb } from "@/lib/db";
import {
  serializePublicState,
  type LiveMatchDocument,
  type NextMatchDocument,
  type TeamDocument,
  type UpcomingMatchDocument,
  type PastMatchDocument,
} from "@/lib/serializers";
import { LiveMatch } from "@/models/LiveMatch";
import { NextMatch } from "@/models/NextMatch";
import { UpcomingMatch } from "@/models/UpcomingMatch";
import { PastMatch } from "@/models/PastMatch";
import { Team } from "@/models/Team";

export async function ensureDefaultDocuments() {

  await connectDb();

  let liveMatch = await LiveMatch.findOne();
  if (!liveMatch) {
    liveMatch = await LiveMatch.create({});
  }

  let nextMatch = await NextMatch.findOne();
  if (!nextMatch) {
    nextMatch = await NextMatch.create({});
  }

  return { liveMatch, nextMatch };
}

export async function getPublicState() {
  await ensureDefaultDocuments();

  const [liveMatch, nextMatch, upcomingMatches, pastMatches, teams] = await Promise.all([
    LiveMatch.findOne().populate("homeTeam awayTeam").lean(),
    NextMatch.findOne().populate("teamOne teamTwo").lean(),
    UpcomingMatch.find({ matchStartAt: { $ne: null } })
      .sort({ matchStartAt: 1 })
      .populate("teamOne teamTwo")
      .lean(),
    PastMatch.find().sort({ matchEndAt: -1 }).populate("teamOne teamTwo").lean(),
    Team.find().sort({ name: 1 }).lean(),
  ]);

  if (!liveMatch || !nextMatch) {
    throw new Error("Default match documents could not be created");
  }

  return serializePublicState({
    liveMatch: liveMatch as LiveMatchDocument,
    nextMatch: nextMatch as NextMatchDocument,
    upcomingMatches: upcomingMatches as UpcomingMatchDocument[],
    pastMatches: pastMatches as PastMatchDocument[],
    teams: teams as TeamDocument[],
  });
}

