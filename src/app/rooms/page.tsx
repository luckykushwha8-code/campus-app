"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { RoomList } from "@/components/rooms";
import { RoomCardData } from "@/components/rooms/room-card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";

export default function RoomsPage() {
  const { isAuthenticated } = useAppSession();
  const [rooms, setRooms] = useState<RoomCardData[]>([]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", description: "", type: "study" });
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadRooms() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/rooms", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to load rooms right now.");
        return;
      }
      setRooms(data.rooms || []);
    } catch {
      setFeedback("Unable to load rooms right now.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return rooms;
    return rooms.filter((room) =>
      [room.name, room.description, room.type].filter(Boolean).join(" ").toLowerCase().includes(trimmed)
    );
  }, [rooms, query]);

  const joinedRooms = filteredRooms.filter((room) => room.isJoined);
  const discoverRooms = filteredRooms.filter((room) => !room.isJoined);

  async function toggleJoin(roomId: string) {
    setFeedback("");
    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to update room membership.");
        return;
      }
      setRooms((current) => current.map((room) => (room.id === roomId ? data.room : room)));
    } catch {
      setFeedback("Unable to update room membership.");
    }
  }

  async function handleCreateRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to create room.");
        return;
      }

      setRooms((current) => [data.room, ...current]);
      setNewRoom({ name: "", description: "", type: "study" });
      setShowCreate(false);
      setFeedback("Room created and joined successfully.");
    } catch {
      setFeedback("Unable to create room.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Campus Rooms</h1>
          <p className="text-gray-600">Join rooms, create your own spaces, and keep your community organized.</p>
        </div>
        <button className="button-clean flex items-center gap-2" onClick={() => setShowCreate((value) => !value)} type="button">
          <Plus className="h-4 w-4" />
          {showCreate ? "Close" : "Create Room"}
        </button>
      </div>

      {!isAuthenticated ? (
        <div className="mb-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-4 text-sm text-[var(--text-secondary)]">
          Sign in to create rooms or join shared communities.
        </div>
      ) : null}

      {feedback ? (
        <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
          {feedback}
        </div>
      ) : null}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search rooms..." className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
      </div>

      {showCreate ? (
        <form className="mb-8 grid gap-4 rounded-3xl border border-[var(--border-color)] bg-white p-5" onSubmit={handleCreateRoom}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Room name" value={newRoom.name} onChange={(event) => setNewRoom((current) => ({ ...current, name: event.target.value }))} />
            <select
              className="input-clean"
              value={newRoom.type}
              onChange={(event) => setNewRoom((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="study">Study</option>
              <option value="class">Class</option>
              <option value="club">Club</option>
              <option value="placement">Placement</option>
              <option value="buysell">Marketplace</option>
            </select>
          </div>
          <textarea
            className="input-clean min-h-[110px] resize-none"
            placeholder="What is this room for?"
            value={newRoom.description}
            onChange={(event) => setNewRoom((current) => ({ ...current, description: event.target.value }))}
          />
          <div className="flex gap-3">
            <button className="button-clean" type="submit">Save Room</button>
            <button className="button-outline" onClick={() => setShowCreate(false)} type="button">Cancel</button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-8 text-sm text-[var(--text-secondary)]">
          Loading rooms...
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Your Rooms</h2>
            {joinedRooms.length ? (
              <RoomList rooms={joinedRooms} onToggleJoin={toggleJoin} />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                You have not joined any rooms yet. Join one from the list below or create your own.
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Discover More</h2>
            {discoverRooms.length ? (
              <RoomList rooms={discoverRooms} onToggleJoin={toggleJoin} />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                No more rooms match this search right now.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
