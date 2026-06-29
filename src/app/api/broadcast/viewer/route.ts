import { NextRequest, NextResponse } from "next/server";

import { cleanViewerId, getActiveBroadcastSession } from "@/lib/broadcast";
import { connectDb } from "@/lib/db";
import { BroadcastPeer } from "@/models/BroadcastPeer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const activeSessionId = await getActiveBroadcastSession();
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const viewerId = cleanViewerId(request.nextUrl.searchParams.get("viewerId"));

  if (!activeSessionId || activeSessionId !== sessionId) {
    return NextResponse.json({ active: false });
  }

  if (!viewerId) {
    return NextResponse.json({ message: "Viewer id is required" }, { status: 400 });
  }

  await connectDb();
  const peer = await BroadcastPeer.findOne({
    sessionId: activeSessionId,
    viewerId,
  }).lean<{
    answer?: unknown;
    broadcasterCandidates?: unknown[];
  }>();

  return NextResponse.json({
    active: true,
    answer: peer?.answer ?? null,
    broadcasterCandidates: peer?.broadcasterCandidates ?? [],
  });
}
