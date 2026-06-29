import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { connectDb } from "@/lib/db";
import { ensureDefaultDocuments } from "@/lib/data";
import { UpcomingMatch } from "@/models/UpcomingMatch";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const payload = await request.json();
  await connectDb();
  await ensureDefaultDocuments();

  const match = await UpcomingMatch.create({
    teamOne: payload.teamOne || null,
    teamTwo: payload.teamTwo || null,
    matchStartAt: payload.matchStartAt ? new Date(payload.matchStartAt) : null,
  });

  return NextResponse.json({ ok: true, id: match._id });
}

export async function DELETE(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const payload = await request.json().catch(() => ({}));
  const id = String(payload.id ?? "");
  if (!id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  await connectDb();
  await UpcomingMatch.findByIdAndDelete(id);

  await ensureDefaultDocuments();

  return NextResponse.json({ ok: true });
}

