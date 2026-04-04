"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Hash, ArrowRight, Trash2 } from "lucide-react";

export interface RoomCardData {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  type: string;
  membersCount: number;
  isJoined: boolean;
  isOwner?: boolean;
  creatorName?: string;
  createdAt?: string;
}

interface RoomCardProps {
  room: RoomCardData;
  onToggleJoin: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
  isJoining?: boolean;
  isDeleting?: boolean;
}

export function RoomCard({ room, onToggleJoin, onDelete, isJoining, isDeleting }: RoomCardProps) {
  const typeLabels: Record<string, string> = {
    college: "College",
    school: "School",
    hostel: "Hostel",
    department: "Dept",
    class: "Class",
    event: "Event",
    club: "Club",
    study: "Study",
    placement: "Career",
    internship: "Intern",
    buysell: "Market",
  };

  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 min-w-11 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] px-2 text-xs font-semibold text-[var(--accent)]">
            {typeLabels[room.type] || "Room"}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">{room.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Hash className="h-3 w-3" />
              {room.type}
            </div>
          </div>
        </div>
        {room.isOwner ? <Badge variant="secondary">Owner</Badge> : null}
      </div>

      {room.description ? <p className="mt-3 text-sm text-gray-600 line-clamp-2">{room.description}</p> : null}
      {room.creatorName ? <p className="mt-2 text-xs text-gray-500">Created by {room.creatorName}</p> : null}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {room.membersCount} members
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/rooms/${room.id}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50">
            Open
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Button onClick={() => onToggleJoin(room.id)} variant={room.isJoined ? "outline" : "default"} size="sm" disabled={isJoining}>
            {isJoining ? "Saving..." : room.isJoined ? "Leave" : "Join"}
          </Button>
          {room.isOwner && onDelete ? (
            <button
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              onClick={() => onDelete(room.id)}
              disabled={isDeleting}
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
