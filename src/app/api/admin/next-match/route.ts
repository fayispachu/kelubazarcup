import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { ensureDefaultDocuments } from "@/lib/data";
import { connectDb } from "@/lib/db";
import { NextMatch } from "@/models/NextMatch";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const payload = await request.json();
  await connectDb();
  await ensureDefaultDocuments();

  const update = {
    teamOne: payload.teamOne || null,
    teamTwo: payload.teamTwo || null,
    matchDate: String(payload.matchDate ?? ""),
    matchTime: String(payload.matchTime ?? ""),
  };

  await NextMatch.findOneAndUpdate({}, update, {
    new: true,
    runValidators: true,
  });

  return NextResponse.json({ ok: true });
}
