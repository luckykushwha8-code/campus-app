"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ShieldCheck, UserRound, Smartphone, KeyRound, Eye, Globe, LogOut } from "lucide-react";
import { DEFAULT_USER_SETTINGS, type AppUserSettings, getStorageItem, setStorageItem } from "@/lib/app-session";
import { useAppSession } from "@/hooks/use-app-session";

export default function SettingsPage() {
  const { user, isAuthenticated, logout, updateUser } = useAppSession();
  const storageKey = user ? `campuslink_settings_${user.id}` : "campuslink_settings_guest";
  const [settings, setSettings] = useState<AppUserSettings>(DEFAULT_USER_SETTINGS);
  const [savedMessage, setSavedMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const actionButtonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0";
  const settingsRef = useRef<AppUserSettings>(DEFAULT_USER_SETTINGS);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return;

      const localSettings = getStorageItem(storageKey, DEFAULT_USER_SETTINGS);

      try {
        const response = await fetch("/api/user/settings", { cache: "no-store" });
        const data = await response.json();
        if (response.ok && data.ok && data.settings) {
          const nextSettings = {
            ...DEFAULT_USER_SETTINGS,
            ...(data.settings || {}),
          };
          setSettings(nextSettings);
          setStorageItem(storageKey, nextSettings);
          updateUser({ settings: nextSettings });
          setSavedMessage("Preferences synced with your account.");
          setIsLoaded(true);
          return;
        }
      } catch {
        // Fall back to browser storage below.
      }

      setSettings(localSettings);
      setSavedMessage("Preferences loaded from this device.");
      setIsLoaded(true);
    }

    loadSettings();
  }, [storageKey, updateUser, user?.id]);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const timeout = window.setTimeout(async () => {
      const nextSettings = settingsRef.current;
      setStorageItem(storageKey, nextSettings);
      setIsSaving(true);

      try {
        const response = await fetch("/api/user/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            updates: {
              settings: nextSettings,
            },
          }),
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          setSavedMessage(data.error || "Preferences saved only on this device right now.");
          return;
        }

        updateUser({ settings: nextSettings });
        setSavedMessage("Preferences saved to your account.");
      } catch {
        setSavedMessage("Preferences saved on this device. Account sync will retry later.");
      } finally {
        setIsSaving(false);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [isLoaded, settings, storageKey, updateUser, user?.id]);

  const privacyMode = useMemo(() => {
    if (!settings.profileVisible) return "Hidden";
    if (settings.publicProfile) return "Public";
    return "Campus only";
  }, [settings.profileVisible, settings.publicProfile]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--border-color)] bg-white p-8 text-center shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <p className="text-sm font-medium text-[var(--accent)]">Settings locked</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Sign in to manage your app settings</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Once you log in, we will keep your notification and privacy choices with your account on this device.
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

  function toggleSetting(key: keyof AppUserSettings) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-[var(--border-color)] bg-white p-5 shadow-[0_18px_60px_rgba(17,24,39,0.07)] sm:p-6 lg:p-8">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(37,99,235,0.10)_0%,rgba(15,23,42,0.03)_52%,rgba(14,165,233,0.10)_100%)] px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[var(--accent)]">Settings</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">Control your campus presence</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                Manage your account, privacy, notifications, and session for {user.name}.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <Link
                href="/profile"
                className={`${actionButtonClass} border-[var(--border-light)] bg-white text-[var(--accent)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:bg-[var(--bg-secondary)]`}
              >
                Back to profile
              </Link>
              <button
                className={`${actionButtonClass} border-transparent bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-color)] hover:bg-white hover:text-[var(--text-primary)]`}
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <SettingsCard
              icon={Bell}
              title="Notifications"
              description="Choose how the app should reach you when campus activity happens."
              options={[
                {
                  label: "Push notifications",
                  description: "Important campus alerts and mentions",
                  enabled: settings.pushNotifications,
                  onToggle: () => toggleSetting("pushNotifications"),
                },
                {
                  label: "Room alerts",
                  description: "Messages and room activity you joined",
                  enabled: settings.roomAlerts,
                  onToggle: () => toggleSetting("roomAlerts"),
                },
                {
                  label: "Email updates",
                  description: "Weekly product and account summaries",
                  enabled: settings.emailUpdates,
                  onToggle: () => toggleSetting("emailUpdates"),
                },
              ]}
            />

            <SettingsCard
              icon={ShieldCheck}
              title="Privacy"
              description="Control who can discover you and what profile details are visible."
              options={[
                {
                  label: "Visible profile",
                  description: "Let classmates find your profile",
                  enabled: settings.profileVisible,
                  onToggle: () => toggleSetting("profileVisible"),
                },
                {
                  label: "Show college details",
                  description: "Display college name and campus ID on your page",
                  enabled: settings.showCollegeDetails,
                  onToggle: () => toggleSetting("showCollegeDetails"),
                },
                {
                  label: "Show activity status",
                  description: "Let others know when you were recently active",
                  enabled: settings.showActivityStatus,
                  onToggle: () => toggleSetting("showActivityStatus"),
                },
                {
                  label: "Public profile",
                  description: "Allow profile viewing outside your private campus flow",
                  enabled: settings.publicProfile,
                  onToggle: () => toggleSetting("publicProfile"),
                },
              ]}
            />

            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-[var(--accent)]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Account & session</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Manage where you are signed in and how your account is shown.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Email</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{user.email}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Privacy mode</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{privacyMode}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <p className="rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
                  You are signed in on this device and your session is active.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SummaryCard icon={UserRound} title="Account" value={user.name} hint="Profile name" />
            <SummaryCard icon={Eye} title="Visibility" value={privacyMode} hint="Current privacy mode" />
            <SummaryCard icon={Globe} title="Campus" value={user.collegeName || "Not set"} hint="Current campus" />
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-[var(--accent)]">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Device status</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Preferences sync to your account and stay available on this browser.</p>
                </div>
              </div>
              <p className="mt-4 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
                {isSaving ? "Saving your preferences..." : savedMessage || "Preferences will save automatically once you make a change."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  options,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  options: Array<{
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
  }>;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white p-3 text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {options.map((option) => (
          <button
            key={option.label}
            className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-left"
            onClick={option.onToggle}
            type="button"
          >
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{option.label}</p>
              <p className="text-sm text-[var(--text-secondary)]">{option.description}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                option.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {option.enabled ? "On" : "Off"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  hint,
}: {
  icon: typeof UserRound;
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white p-3 text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="text-xs text-[var(--text-muted)]">{hint}</p>
        </div>
      </div>
    </div>
  );
}
