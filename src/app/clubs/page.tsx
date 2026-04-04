"use client";

import { useEffect, useMemo, useState } from "react";
import { ClubCard } from "@/components/utilities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { getStorageItem, setStorageItem } from "@/lib/app-session";

const STORAGE_KEY = "campuslink_clubs";

const defaultClubs = [
  {
    id: "1",
    name: "Tech Club",
    description: "Coding, development, and technology enthusiasts. We organize hackathons, workshops, and coding contests.",
    logo: "https://picsum.photos/seed/club1/100/100",
    membersCount: 234,
    isMember: true,
  },
  {
    id: "2",
    name: "Cultural Club",
    description: "Arts, music, dance, and cultural events. The heart of campus creativity.",
    logo: "https://picsum.photos/seed/club2/100/100",
    membersCount: 189,
    isMember: false,
  },
  {
    id: "3",
    name: "Sports Club",
    description: "All sports activities and tournaments. Stay fit and compete!",
    logo: "https://picsum.photos/seed/club3/100/100",
    membersCount: 312,
    isMember: true,
  },
  {
    id: "4",
    name: "Photography Club",
    description: "Capture moments and learn photography skills.",
    logo: "https://picsum.photos/seed/club4/100/100",
    membersCount: 156,
    isMember: false,
  },
  {
    id: "5",
    name: "AI/ML Club",
    description: "Artificial Intelligence and Machine Learning enthusiasts.",
    logo: "https://picsum.photos/seed/club5/100/100",
    membersCount: 178,
    isMember: false,
  },
  {
    id: "6",
    name: "Literary Club",
    description: "Debates, quizzes, writing, and literature appreciation.",
    logo: "https://picsum.photos/seed/club6/100/100",
    membersCount: 98,
    isMember: false,
  },
];

export default function ClubsPage() {
  const [clubs, setClubs] = useState(defaultClubs);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setClubs(getStorageItem(STORAGE_KEY, defaultClubs));
  }, []);

  useEffect(() => {
    setStorageItem(STORAGE_KEY, clubs);
  }, [clubs]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return clubs;
    return clubs.filter((club) => `${club.name} ${club.description || ""}`.toLowerCase().includes(trimmed));
  }, [clubs, query]);

  function toggleMembership(clubId: string) {
    setClubs((current) =>
      current.map((club) =>
        club.id === clubId
          ? {
              ...club,
              isMember: !club.isMember,
              membersCount: club.isMember ? Math.max(0, club.membersCount - 1) : club.membersCount + 1,
            }
          : club
      )
    );
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
        <button className="button-clean flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Club
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-9" placeholder="Search clubs..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Clubs</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((club) => (
              <ClubCard key={club.id} club={club} onToggleMembership={toggleMembership} />
            ))}
          </div>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popular.map((club) => (
              <ClubCard key={club.id} club={club} onToggleMembership={toggleMembership} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
