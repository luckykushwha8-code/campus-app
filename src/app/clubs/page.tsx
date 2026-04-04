"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ClubCard } from "@/components/utilities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";

type ClubItem = {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  membersCount: number;
  isMember: boolean;
};

export default function ClubsPage() {
  const { isAuthenticated, token } = useAppSession();
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", logo: "" });

  const loadClubs = useCallback(async () => {
    setIsLoading(true);
    setFeedback("");
    try {
      const response = await fetch("/api/clubs", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to load clubs.");
        return;
      }
      setClubs(data.clubs || []);
    } catch {
      setFeedback("Unable to load clubs.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return clubs;
    return clubs.filter((club) => `${club.name} ${club.description || ""}`.toLowerCase().includes(trimmed));
  }, [clubs, query]);

  async function toggleMembership(clubId: string) {
    setFeedback("");
    try {
      const response = await fetch("/api/clubs/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ clubId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to update club membership.");
        return;
      }
      setClubs((current) => current.map((club) => (club.id === clubId ? data.club : club)));
    } catch {
      setFeedback("Unable to update club membership.");
    }
  }

  async function handleCreateClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    try {
      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to create club.");
        return;
      }
      setClubs((current) => [data.club, ...current]);
      setForm({ name: "", description: "", logo: "" });
      setShowCreate(false);
      setFeedback("Club created and joined successfully.");
    } catch {
      setFeedback("Unable to create club.");
    }
  }

  const joined = filtered.filter((club) => club.isMember);
  const popular = [...filtered].sort((a, b) => b.membersCount - a.membersCount);

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clubs & Societies</h1>
          <p className="text-gray-600">Join clubs, manage your communities, and discover student spaces.</p>
        </div>
        <button className="button-clean flex items-center gap-2" onClick={() => setShowCreate((value) => !value)} type="button">
          <Plus className="h-4 w-4" />
          {showCreate ? "Close" : "Create Club"}
        </button>
      </div>

      {!isAuthenticated ? (
        <div className="mb-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-4 text-sm text-[var(--text-secondary)]">
          Sign in to join or create clubs.
        </div>
      ) : null}

      {feedback ? (
        <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
          {feedback}
        </div>
      ) : null}

      {showCreate ? (
        <form className="mb-6 grid gap-4 rounded-3xl border border-[var(--border-color)] bg-white p-5" onSubmit={handleCreateClub}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Club name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <Input placeholder="Logo URL (optional)" value={form.logo} onChange={(event) => setForm((current) => ({ ...current, logo: event.target.value }))} />
          </div>
          <textarea
            className="input-clean min-h-[110px] resize-none"
            placeholder="What is this club about?"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <div className="flex gap-3">
            <button className="button-clean" type="submit">Create Club</button>
            <button className="button-outline" onClick={() => setShowCreate(false)} type="button">Cancel</button>
          </div>
        </form>
      ) : null}

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-9" placeholder="Search clubs..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-8 text-sm text-[var(--text-secondary)]">
          Loading clubs...
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filtered.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((club) => (
                  <ClubCard key={club.id} club={club} onToggleMembership={toggleMembership} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                No clubs match your search yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="joined">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {joined.length ? joined.map((club) => (
                <ClubCard key={club.id} club={club} onToggleMembership={toggleMembership} />
              )) : (
                <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                  Join a club and it will show up here.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="popular">
            {popular.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {popular.map((club) => (
                  <ClubCard key={club.id} club={club} onToggleMembership={toggleMembership} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                No clubs are available yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
