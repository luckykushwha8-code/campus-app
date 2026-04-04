"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { normalizeUser } from "@/lib/app-session";
import { useAppSession } from "@/hooks/use-app-session";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      login({
        token: data.token,
        user: normalizeUser(data.user),
      });
      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fbff_0%,#eef4ff_45%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8">
        <section className="hidden rounded-[28px] border border-[var(--border-color)] bg-white/80 p-10 shadow-[0_20px_70px_rgba(37,99,235,0.08)] backdrop-blur lg:block">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">CampusLink</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-[var(--text-primary)]">
              Sign in to your campus network.
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">
              Access notes, rooms, placements, stories, and campus conversations from one verified student space.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                <p className="text-2xl font-semibold text-[var(--text-primary)]">24/7</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Active student feed</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                <p className="text-2xl font-semibold text-[var(--text-primary)]">Rooms</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Batch and club spaces</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                <p className="text-2xl font-semibold text-[var(--text-primary)]">Notes</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Study resources and uploads</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto max-w-md rounded-[28px] border border-[var(--border-color)] bg-white p-6 shadow-[0_20px_70px_rgba(17,24,39,0.08)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-[var(--accent)]">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Log in</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Use your account to continue into CampusLink.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@college.edu"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <button className="button-clean w-full justify-center" disabled={isLoading} type="submit">
                {isLoading ? "Signing in..." : "Log in"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              New here?{" "}
              <Link className="font-medium text-[var(--accent)] hover:underline" href="/signup">
                Create an account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
