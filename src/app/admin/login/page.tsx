import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  try {
    const session = await getAdminSession();

    if (session?.user?.id) {
      redirect("/admin");
    }
  } catch {
    // Fall back to the login form when the session cannot be resolved during build.
  }

  return <LoginForm />;
}
