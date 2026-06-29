import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { connectDb } from "@/lib/db";
import { Team } from "@/models/Team";

export const dynamic = "force-dynamic";

async function fileToDataUrl(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const logo = formData.get("logo");

  if (!name) {
    return NextResponse.json({ message: "Team name is required" }, { status: 400 });
  }

  await connectDb();
  const logoUrl = logo instanceof File && logo.size > 0 ? await fileToDataUrl(logo) : "";
  await Team.create({ name, logoUrl });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const formData = await request.formData();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const logo = formData.get("logo");

  if (!id || !name) {
    return NextResponse.json({ message: "Team id and name are required" }, { status: 400 });
  }

  await connectDb();

  const update: { name: string; logoUrl?: string } = { name };
  if (logo instanceof File && logo.size > 0) {
    update.logoUrl = await fileToDataUrl(logo);
  }

  await Team.findByIdAndUpdate(id, update, { runValidators: true });

  return NextResponse.json({ ok: true });
}
