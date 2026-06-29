import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { connectDb } from "@/lib/db";
import { BroadcastPeer } from "@/models/BroadcastPeer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const sessionId = request.nextUrl.searchParams.get("sessionId") ?? "";
  if (!sessionId) {
    return NextResponse.json({ peers: [] });
  }

  await connectDb();
  const peers = await BroadcastPeer.find({ sessionId })
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    peers: peers.map((peer) => ({
      viewerId: peer.viewerId,
      offer: peer.offer,
      answer: peer.answer,
      viewerCandidates: peer.viewerCandidates ?? [],
      updatedAt: peer.updatedAt,
    })),
  });
}
