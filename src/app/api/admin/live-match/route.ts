import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { ensureDefaultDocuments } from "@/lib/data";
import { connectDb } from "@/lib/db";
import { BroadcastPeer } from "@/models/BroadcastPeer";
import { LiveMatch } from "@/models/LiveMatch";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const payload = await request.json();
  await connectDb();
  await ensureDefaultDocuments();

  const update = {
    streamUrl: String(payload.streamUrl ?? ""),
    broadcastSessionId: String(payload.broadcastSessionId ?? ""),
    homeTeam: payload.homeTeam || null,
    awayTeam: payload.awayTeam || null,
    homeScore: Math.max(0, Number(payload.homeScore ?? 0)),
    awayScore: Math.max(0, Number(payload.awayScore ?? 0)),
    minute: String(payload.minute ?? "0'"),
    phase: String(payload.phase ?? "NOT_STARTED"),
    countdownEndsAt: payload.countdownEndsAt ? new Date(payload.countdownEndsAt) : null,
    countdownDurationSeconds: Math.max(0, Number(payload.countdownDurationSeconds ?? 0)),
    isLive: Boolean(payload.isLive),
  };

  await LiveMatch.findOneAndUpdate({}, update, {
    new: true,
    runValidators: true,
  });

  if (!update.isLive || !update.broadcastSessionId) {
    await BroadcastPeer.deleteMany({});
  } else {
    await BroadcastPeer.deleteMany({
      sessionId: { $ne: update.broadcastSessionId },
    });
  }

  return NextResponse.json({ ok: true });
}
