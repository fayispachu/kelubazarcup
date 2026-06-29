import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, response: null };
}
