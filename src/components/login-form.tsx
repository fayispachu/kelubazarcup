"use client";

import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

export function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setIsLoading(false);

    if (result?.ok) {
      window.location.href = "/admin";
      return;
    }

    setError("Invalid admin credentials");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-md border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Kelubazar Cup Live
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
              Admin login
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Email
            <input
              className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Password
            <input
              className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            type="submit"
            disabled={isLoading}
          >
            <LogIn size={16} /> {isLoading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
