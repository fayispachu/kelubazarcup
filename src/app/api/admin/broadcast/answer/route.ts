import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { cleanViewerId, isPlainDescription } from "@/lib/broadcast";
import { connectDb } from "@/lib/db";
import { BroadcastPeer } from "@/models/BroadcastPeer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const payload = await request.json();
  const viewerId = cleanViewerId(payload.viewerId);

  if (!payload.sessionId || !viewerId || !isPlainDescription(payload.answer)) {
    return NextResponse.json({ message: "Invalid answer" }, { status: 400 });
  }

  await connectDb();
  await BroadcastPeer.updateOne(
    { sessionId: payload.sessionId, viewerId },
    {
      $set: {
        answer: payload.answer,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    },
  );

  return NextResponse.json({ ok: true });
}
