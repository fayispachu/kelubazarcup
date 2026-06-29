import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session?.user?.id) {
    redirect("/admin");
  }

  return <LoginForm />;
}
