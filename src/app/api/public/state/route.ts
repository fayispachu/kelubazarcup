import { NextResponse } from "next/server";

import { getPublicState } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getPublicState();
  return NextResponse.json(state);
}
