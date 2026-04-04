"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Unable to send reset email right now.");
        return;
      }

      setStatus(data.message || "If that email exists, a reset link has been sent.");
    } catch {
      setError("Unable to send reset email right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fbff_0%,#eef4ff_45%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full">
          <div className="mx-auto max-w-md rounded-[28px] border border-[var(--border-color)] bg-white p-6 shadow-[0_20px_70px_rgba(17,24,39,0.08)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-[var(--accent)]">Account recovery</p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Forgot password?</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Enter your account email and we will send you a secure reset link.
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

              {status ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {status}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <button className="button-clean w-full justify-center" disabled={isLoading} type="submit">
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Remembered it?{" "}
              <Link className="font-medium text-[var(--accent)] hover:underline" href="/login">
                Back to login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
