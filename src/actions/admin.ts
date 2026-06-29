"use server";

import { revalidatePath } from "next/cache";

export async function revalidateMatchViews() {
  revalidatePath("/");
  revalidatePath("/admin");
}
