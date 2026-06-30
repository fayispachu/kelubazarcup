import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDb } from "@/lib/db";
import { LiveMatch } from "@/models/LiveMatch";

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDb();

    const body = await request.json();
    const { musicEnabled } = body;

    // Update the music state for the live broadcast
    const liveMatch = await LiveMatch.findOneAndUpdate(
      {},
      {
        musicEnabled: Boolean(musicEnabled),
        musicUrl: "/music.m4a",
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      ok: true,
      musicEnabled: liveMatch?.musicEnabled || false,
    });
  } catch (error) {
    console.error("Error toggling music:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to toggle music" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDb();

    const liveMatch = await LiveMatch.findOne({});
    return NextResponse.json({
      musicEnabled: liveMatch?.musicEnabled || false,
      musicUrl: liveMatch?.musicUrl || "/music.m4a",
    });
  } catch (error) {
    console.error("Error fetching music state:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch music state" },
      { status: 500 }
    );
  }
}
