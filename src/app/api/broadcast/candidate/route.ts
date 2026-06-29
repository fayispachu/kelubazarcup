import { NextRequest, NextResponse } from "next/server";

import {
  cleanViewerId,
  getActiveBroadcastSession,
  isPlainCandidate,
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

  if (!viewerId || !isPlainCandidate(payload.candidate)) {
    return NextResponse.json({ message: "Invalid candidate" }, { status: 400 });
  }

  await connectDb();
  await BroadcastPeer.updateOne(
    { sessionId: activeSessionId, viewerId },
    {
      $push: { viewerCandidates: payload.candidate },
      $set: { expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    },
  );

  return NextResponse.json({ ok: true });
}
