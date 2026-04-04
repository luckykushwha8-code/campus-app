"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { RoomList } from "@/components/rooms";
import { RoomCardData } from "@/components/rooms/room-card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { getStorageItem, setStorageItem } from "@/lib/app-session";

const STORAGE_KEY = "campuslink_rooms";

const defaultRooms: RoomCardData[] = [
  {
    id: "1",
    name: "CSE 2025",
    description: "Computer Science batch 2025 students",
    type: "class",
    membersCount: 156,
    isJoined: true,
  },
  {
    id: "2",
    name: "NIT Trichy Campus",
    description: "Main campus discussions",
    type: "college",
    membersCount: 2340,
    isJoined: true,
  },
  {
    id: "3",
    name: "Placement Cell",
    description: "All placement and internship updates",
    type: "placement",
    membersCount: 890,
    isJoined: true,
  },
  {
    id: "4",
    name: "Tech Club",
    description: "Technical events and workshops",
    type: "club",
    membersCount: 234,
    isJoined: false,
  },
  {
    id: "5",
    name: "Hostel A - Boys",
    description: "Hostel A residents",
    type: "hostel",
    membersCount: 312,
    isJoined: true,
  },
  {
    id: "6",
    name: "Buy/Sell Books",
    description: "Buy and sell textbooks",
    type: "buysell",
    membersCount: 567,
    isJoined: false,
  },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomCardData[]>(defaultRooms);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", description: "", type: "study" });

  useEffect(() => {
    setRooms(getStorageItem(STORAGE_KEY, defaultRooms));
  }, []);

  useEffect(() => {
    setStorageItem(STORAGE_KEY, rooms);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return rooms;
    return rooms.filter((room) =>
      [room.name, room.description, room.type].filter(Boolean).join(" ").toLowerCase().includes(trimmed)
    );
  }, [rooms, query]);

  const joinedRooms = filteredRooms.filter((room) => room.isJoined);
  const discoverRooms = filteredRooms.filter((room) => !room.isJoined);

  function toggleJoin(roomId: string) {
    setRooms((current) =>
      current.map((room) =>
        room.id === roomId
          ? {
              ...room,
              isJoined: !room.isJoined,
              membersCount: room.isJoined ? Math.max(0, room.membersCount - 1) : room.membersCount + 1,
            }
          : room
      )
    );
  }

  function handleCreateRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newRoom.name.trim()) return;

    const room: RoomCardData = {
      id: Date.now().toString(),
      name: newRoom.name.trim(),
      description: newRoom.description.trim(),
      type: newRoom.type,
      membersCount: 1,
      isJoined: true,
    };

    setRooms((current) => [room, ...current]);
    setNewRoom({ name: "", description: "", type: "study" });
    setShowCreate(false);
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Campus Rooms</h1>
          <p className="text-gray-600">Join rooms, create your own spaces, and keep your community organized.</p>
        </div>
        <button className="button-clean flex items-center gap-2" onClick={() => setShowCreate((value) => !value)}>
          <Plus className="h-4 w-4" />
          {showCreate ? "Close" : "Create Room"}
        </button>
      </div>

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
    </div>
  );
}
