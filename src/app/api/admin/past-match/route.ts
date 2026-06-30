import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { ensureDefaultDocuments } from "@/lib/data";
import { connectDb } from "@/lib/db";
import { BroadcastPeer } from "@/models/BroadcastPeer";
import { LiveMatch } from "@/models/LiveMatch";
import { PastMatch } from "@/models/PastMatch";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const payload = await request.json();
  await connectDb();
  await ensureDefaultDocuments();

  const finishedMatch = await PastMatch.create({
    teamOne: payload.homeTeam || null,
    teamTwo: payload.awayTeam || null,
    homeScore: Math.max(0, Number(payload.homeScore ?? 0)),
    awayScore: Math.max(0, Number(payload.awayScore ?? 0)),
    matchStartAt: new Date(),
    matchEndAt: new Date(),
  });

  await LiveMatch.findOneAndUpdate(
    {},
    {
      streamUrl: "",
      broadcastSessionId: "",
      homeTeam: null,
      awayTeam: null,
      homeScore: 0,
      awayScore: 0,
      minute: "0'",
      phase: "NOT_STARTED",
      countdownEndsAt: null,
      countdownDurationSeconds: 0,
      isLive: false,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  await BroadcastPeer.deleteMany({});

  return NextResponse.json({ ok: true, pastMatchId: finishedMatch._id });
}
