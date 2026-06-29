import { NextRequest, NextResponse } from "next/server";

import {
  cleanViewerId,
  getActiveBroadcastSession,
  isPlainDescription,
} from "@/lib/broadcast";
import { connectDb } from "@/lib/db";
import { BroadcastPeer } from "@/models/BroadcastPeer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const activeSessionId = await getActiveBroadcastSession();
  const viewerId = cleanViewerId(payload.viewerId);

  if (!activeSessionId || activeSessionId !== payload.sessionId) {
    return NextResponse.json({ message: "Broadcast is not active" }, { status: 409 });
  }

  if (!viewerId || !isPlainDescription(payload.offer) || payload.offer.type !== "offer") {
    return NextResponse.json({ message: "Invalid offer" }, { status: 400 });
  }

  await connectDb();
  await BroadcastPeer.findOneAndUpdate(
    { sessionId: activeSessionId, viewerId },
    {
      sessionId: activeSessionId,
      viewerId,
      offer: payload.offer,
      answer: null,
      viewerCandidates: [],
      broadcasterCandidates: [],
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return NextResponse.json({ ok: true });
}
