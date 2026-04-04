"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAppSession } from "@/hooks/use-app-session";
import { buildUsername, normalizeUser } from "@/lib/app-session";
import { MapPin, Calendar, GraduationCap, BadgeCheck, Settings, Edit3, LogOut } from "lucide-react";

type ProfileForm = {
  name: string;
  bio: string;
  collegeName: string;
  collegeId: string;
  avatarUrl: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAppSession();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    collegeName: "",
    collegeId: "",
    avatarUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        collegeName: user.collegeName || "",
        collegeId: user.collegeId || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const updates = {
      name: form.name.trim(),
      bio: form.bio.trim(),
      collegeName: form.collegeName.trim(),
      collegeId: form.collegeId.trim(),
      avatarUrl: form.avatarUrl.trim(),
      username: buildUsername(user.email, form.name.trim()),
    };

    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          updates,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatusMessage(data.error || "Unable to save profile right now.");
        return;
      }

      updateUser(normalizeUser({ ...user, ...updates }));
      setIsEditing(false);
      setStatusMessage("Profile updated successfully.");
    } catch {
      updateUser(normalizeUser({ ...user, ...updates }));
      setIsEditing(false);
      setStatusMessage("Saved locally. Server update can sync later.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
    router.refresh();
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--border-color)] bg-white p-8 text-center shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <p className="text-sm font-medium text-[var(--accent)]">Profile locked</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Sign in to set up your profile</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Login unlocks your profile details, room memberships, event registrations, and saved campus activity.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link className="button-clean" href="/login">
              Login
            </Link>
            <Link className="button-outline" href="/signup">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-screen-lg px-4 py-8">
        <div className="rounded-[28px] border border-[var(--border-color)] bg-white p-6 shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar alt={user.name} src={user.avatarUrl} className="h-20 w-20" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{user.name}</h1>
                  {user.verified ? <BadgeCheck className="h-4 w-4 text-[var(--accent)]" /> : null}
                </div>
                <p className="mt-1 text-sm text-[var(--text-muted)]">@{user.username}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="button-outline flex items-center gap-2" onClick={() => setIsEditing((value) => !value)}>
                <Edit3 className="h-4 w-4" />
                {isEditing ? "Close Edit" : "Edit Profile"}
              </button>
              <button className="button-ghost flex items-center gap-2" onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button className="button-ghost flex items-center gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-sm text-[var(--text-muted)] sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--bg-secondary)] px-4 py-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>{user.collegeName || "Add your college"}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--bg-secondary)] px-4 py-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{user.collegeId || "Add your campus ID"}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--bg-secondary)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{user.bio || "Tell people what you are into"}</span>
              </div>
            </div>
          </div>

          {statusMessage ? (
            <div className="mt-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {statusMessage}
            </div>
          ) : null}

          {isEditing ? (
            <form className="mt-6 grid gap-4 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5" onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Name</label>
                  <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Avatar URL</label>
                  <Input value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">College</label>
                  <Input value={form.collegeName} onChange={(event) => setForm((current) => ({ ...current, collegeName: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">College ID</label>
                  <Input value={form.collegeId} onChange={(event) => setForm((current) => ({ ...current, collegeId: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Bio</label>
                <textarea
                  className="input-clean min-h-[120px] w-full resize-none"
                  value={form.bio}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  placeholder="Tell your campus who you are."
                />
              </div>
              <div className="flex gap-3">
                <button className="button-clean" disabled={isSaving} type="submit">
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <button className="button-outline" onClick={() => setIsEditing(false)} type="button">
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <div className="mt-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">Settings</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Manage notifications, privacy, and your device preferences.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">Campus identity</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Keep your profile updated so classmates can recognize you quickly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
