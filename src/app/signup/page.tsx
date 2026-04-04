"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { normalizeUser, saveLocalAccount } from "@/lib/app-session";
import { useAppSession } from "@/hooks/use-app-session";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAppSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: normalizedEmail,
          password,
          collegeName,
          collegeId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        if (data.error === "Server error") {
          const fallbackUser = normalizeUser({
            id: `local-${Date.now()}`,
            email: normalizedEmail,
            name,
            collegeName,
            collegeId,
            bio: "",
            avatarUrl: "",
            verified: false,
          });
          saveLocalAccount({
            email: normalizedEmail,
            password,
            user: fallbackUser,
          });
          login({
            token: `local-${Date.now()}`,
            user: fallbackUser,
          });
          router.push("/");
          router.refresh();
          return;
        }
        setError(data.error || "Signup failed. Please try again.");
        return;
      }

      login({
        token: data.token,
        user: normalizeUser(data.user),
      });
      router.push("/");
      router.refresh();
    } catch {
      const fallbackUser = normalizeUser({
        id: `local-${Date.now()}`,
        email: normalizedEmail,
        name,
        collegeName,
        collegeId,
        bio: "",
        avatarUrl: "",
        verified: false,
      });
      saveLocalAccount({
        email: normalizedEmail,
        password,
        user: fallbackUser,
      });
      login({
        token: `local-${Date.now()}`,
        user: fallbackUser,
      });
      router.push("/");
      router.refresh();
      return;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#fbfdff_0%,#eef4ff_45%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:px-8">
        <section className="hidden rounded-[28px] border border-[var(--border-color)] bg-white/80 p-10 shadow-[0_20px_70px_rgba(37,99,235,0.08)] backdrop-blur lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Join CampusLink</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-[var(--text-primary)]">
            Create your campus identity.
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">
            Build your profile, join rooms, register for events, and keep your student network in one place.
          </p>
        </section>

        <section className="w-full">
          <div className="mx-auto max-w-xl rounded-[28px] border border-[var(--border-color)] bg-white p-6 shadow-[0_20px_70px_rgba(17,24,39,0.08)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-[var(--accent)]">Start here</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Create account</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Set up a usable profile so the app can feel personal from your first login.
              </p>
            </div>

            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="name">
                  Full name
                </label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Lucky Kushwaha" required />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="email">
                  Email
                </label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="student@college.edu" required />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="collegeName">
                  College
                </label>
                <Input id="collegeName" value={collegeName} onChange={(event) => setCollegeName(event.target.value)} placeholder="NIT Trichy" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="collegeId">
                  College ID
                </label>
                <Input id="collegeId" value={collegeId} onChange={(event) => setCollegeId(event.target.value)} placeholder="2025CS101" />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]" htmlFor="password">
                  Password
                </label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" required />
              </div>

              {error ? (
                <div className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <button className="button-clean w-full justify-center" disabled={isLoading} type="submit">
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{" "}
              <Link className="font-medium text-[var(--accent)] hover:underline" href="/login">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
