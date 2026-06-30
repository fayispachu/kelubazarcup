import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { LiveStateProvider } from "@/components/live-state-provider";
import { getAdminSession } from "@/lib/auth";
import { getPublicState } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    const session = await getAdminSession();

    if (!session?.user?.id) {
      redirect("/admin/login");
    }
  } catch {
    redirect("/admin/login");
  }

  const state = await getPublicState();

  return (
    <LiveStateProvider initialState={state}>
      <AdminDashboard />
    </LiveStateProvider>
  );
}
