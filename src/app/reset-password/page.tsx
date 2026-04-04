"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Unable to reset the password right now.");
        return;
      }

      setStatus(data.message || "Password updated successfully.");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Unable to reset the password right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full">
        <div className="mx-auto max-w-md rounded-[28px] border border-[var(--border-color)] bg-white p-6 shadow-[0_20px_70px_rgba(17,24,39,0.08)] sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-[var(--accent)]">Reset password</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Choose a new password</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Create a new password for your CampusLink account.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="password">
                New password
              </label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="confirmPassword">
                Confirm password
              </label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat the new password" required />
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
              {isLoading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            <Link className="font-medium text-[var(--accent)] hover:underline" href="/login">
              Back to login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fbff_0%,#eef4ff_45%,#ffffff_100%)]">
      <Suspense fallback={<div className="min-h-screen" />}>
        <ResetPasswordInner />
      </Suspense>
    </div>
  );
}
