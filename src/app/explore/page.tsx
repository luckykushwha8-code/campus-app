"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomList } from "@/components/rooms";
import { ClubCard, EventCard } from "@/components/utilities";
import { useAppSession } from "@/hooks/use-app-session";
import Link from "next/link";

type ExploreRoom = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  type: string;
  membersCount: number;
  isJoined: boolean;
  isOwner?: boolean;
  creatorName?: string;
};

type ExploreClub = {
  id: string;
  name: string;
  description: string;
  logo?: string;
  membersCount: number;
  isMember: boolean;
};

type ExploreEvent = {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  startDate: string;
  organizer: { name: string; avatar?: string };
  attendees: number;
  isRegistered: boolean;
  isOwner?: boolean;
};

export default function ExplorePage() {
  const { token } = useAppSession();
  const [rooms, setRooms] = useState<ExploreRoom[]>([]);
  const [clubs, setClubs] = useState<ExploreClub[]>([]);
  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadExplore = useCallback(async () => {
    setIsLoading(true);
    setStatus("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const [roomsResponse, clubsResponse, eventsResponse] = await Promise.all([
        fetch("/api/rooms", { cache: "no-store", headers }),
        fetch("/api/clubs", { cache: "no-store", headers }),
        fetch("/api/events", { cache: "no-store", headers }),
      ]);

      const [roomsData, clubsData, eventsData] = await Promise.all([
        roomsResponse.json(),
        clubsResponse.json(),
        eventsResponse.json(),
      ]);

      if (!roomsResponse.ok || !roomsData.ok) {
        throw new Error(roomsData.error || "Unable to load rooms.");
      }
      if (!clubsResponse.ok || !clubsData.ok) {
        throw new Error(clubsData.error || "Unable to load clubs.");
      }
      if (!eventsResponse.ok || !eventsData.ok) {
        throw new Error(eventsData.error || "Unable to load events.");
      }

      setRooms(roomsData.rooms || []);
      setClubs(clubsData.clubs || []);
      setEvents(eventsData.events || []);
    } catch (error: any) {
      setStatus(error?.message || "Unable to load explore right now.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadExplore();
  }, [loadExplore]);

  const trendingTopics = useMemo(() => {
    const topicMap = new Map<string, number>();
    events.forEach((event) => {
      if (event.title.toLowerCase().includes("hack")) topicMap.set("#Hackathon", (topicMap.get("#Hackathon") || 0) + 1);
      if (event.location.toLowerCase().includes("campus")) topicMap.set("#CampusLife", (topicMap.get("#CampusLife") || 0) + 1);
    });
    rooms.forEach((room) => {
      const tag = `#${room.type.charAt(0).toUpperCase()}${room.type.slice(1)}`;
      topicMap.set(tag, (topicMap.get(tag) || 0) + 1);
    });

    return Array.from(topicMap.entries()).slice(0, 6);
  }, [events, rooms]);

  async function toggleRoomJoin(roomId: string) {
    if (!token) {
      setStatus("Please log in to join rooms.");
      return;
    }

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to update room membership.");
        return;
      }

      setRooms((current) => current.map((room) => (room.id === roomId ? data.room : room)));
    } catch {
      setStatus("Unable to update room membership.");
    }
  }

  async function toggleEventRegistration(eventId: string) {
    if (!token) {
      setStatus("Please log in to register for events.");
      return;
    }

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to update event registration.");
        return;
      }

      setEvents((current) => current.map((event) => (event.id === eventId ? data.event : event)));
    } catch {
      setStatus("Unable to update event registration.");
    }
  }

  async function toggleClubMembership(clubId: string) {
    if (!token) {
      setStatus("Please log in to join clubs.");
      return;
    }

    try {
      const response = await fetch("/api/clubs/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clubId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to update club membership.");
        return;
      }

      setClubs((current) => current.map((club) => (club.id === clubId ? data.club : club)));
    } catch {
      setStatus("Unable to update club membership.");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <h1 className="mb-3 text-title font-semibold text-[var(--text-primary)]">Explore</h1>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">Discover the live rooms, clubs, events, and trends around your campus.</p>

        {status ? (
          <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{status}</span>
              <button className="button-outline" onClick={loadExplore} type="button">
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-[var(--border-color)] bg-white px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
            Loading explore...
          </div>
        ) : (
          <Tabs defaultValue="rooms" className="w-full">
            <TabsList className="mb-6 grid grid-cols-2 gap-1 sm:grid-cols-4">
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="clubs">Clubs</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="rooms">
              {rooms.length ? (
                <RoomList rooms={rooms} onToggleJoin={toggleRoomJoin} />
              ) : (
                <EmptyState message="No rooms available yet." />
              )}
            </TabsContent>

            <TabsContent value="clubs">
              {clubs.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {clubs.map((club) => (
                    <ClubCard key={club.id} club={club} onToggleMembership={toggleClubMembership} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No clubs available yet." />
              )}
            </TabsContent>

            <TabsContent value="events">
              {events.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} onToggleRegistration={toggleEventRegistration} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No events available yet." />
              )}
            </TabsContent>

            <TabsContent value="trends">
              {trendingTopics.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {trendingTopics.map(([topic, score]) => (
                    <div key={topic} className="rounded-3xl border border-[var(--border-color)] bg-white p-5">
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{topic}</p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">{score} campus signals right now</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="Trends will appear as your campus activity grows."
                  actionLabel="Browse the live feed"
                  actionHref="/"
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, actionHref, actionLabel }: { message: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--border-color)] bg-white px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
      <p>{message}</p>
      {actionHref && actionLabel ? (
        <Link className="mt-4 inline-flex rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)]" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
