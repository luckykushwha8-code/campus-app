"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, Hash, Trash2 } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";

type RoomDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: string;
  membersCount: number;
  isJoined: boolean;
  isOwner: boolean;
  creatorName: string;
  createdAt: string;
};

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAppSession();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadRoom() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/rooms/${params.id}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          setStatus(data.error || "Unable to load this room.");
          setRoom(null);
          return;
        }
        setRoom(data.room);
        setStatus("");
      } catch {
        setStatus("Unable to load this room.");
        setRoom(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      loadRoom();
    }
  }, [params.id, token]);

  async function handleJoinLeave() {
    if (!token || !room) {
      setStatus("Please log in to join rooms.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId: room.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to update room membership.");
        return;
      }
      setRoom(data.room);
      setStatus(data.room.isJoined ? "You joined this room." : "You left this room.");
    } catch {
      setStatus("Unable to update room membership.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !room?.isOwner) {
      return;
    }

    const confirmed = window.confirm("Delete this room?");
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to delete this room.");
        return;
      }
      router.push("/rooms");
      router.refresh();
    } catch {
      setStatus("Unable to delete this room.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Link href="/rooms" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
        <ArrowLeft className="h-4 w-4" />
        Back to rooms
      </Link>

      {status ? (
        <div className="mb-4 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
          {status}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-3xl border border-[var(--border-color)] bg-white p-6 text-sm text-[var(--text-secondary)]">
          Loading room...
        </div>
      ) : room ? (
        <div className="rounded-3xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
                <Hash className="h-3 w-3" />
                {room.type}
              </div>
              <h1 className="text-3xl font-semibold text-[var(--text-primary)]">{room.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{room.description || "No description yet."}</p>
            </div>

            <div className="flex gap-2">
              <button className={room.isJoined ? "button-outline" : "button-clean"} disabled={isSaving} onClick={handleJoinLeave} type="button">
                {isSaving ? "Saving..." : room.isJoined ? "Leave room" : "Join room"}
              </button>
              {room.isOwner ? (
                <button className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600" disabled={isSaving} onClick={handleDelete} type="button">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Members</p>
              <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
                <Users className="h-4 w-4" />
                {room.membersCount}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Creator</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{room.creatorName}</p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Status</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{room.isJoined ? "Joined" : "Open to join"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--border-color)] bg-white p-6 text-sm text-[var(--text-secondary)]">
          This room could not be found.
        </div>
      )}
    </div>
  );
}
