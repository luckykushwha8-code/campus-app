"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Hash, Lock } from "lucide-react";

export interface RoomCardData {
  id: string;
  name: string;
  description?: string;
  type: string;
  membersCount: number;
  isJoined: boolean;
  lastActivity?: string;
}

interface RoomCardProps {
  room: RoomCardData;
  onToggleJoin: (roomId: string) => void;
}

export function RoomCard({ room, onToggleJoin }: RoomCardProps) {
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
        {!room.isJoined ? (
          <Badge variant="secondary">
            <Lock className="mr-1 h-3 w-3" />
            Private
          </Badge>
        ) : null}
      </div>

      {room.description ? <p className="mt-3 text-sm text-gray-600 line-clamp-2">{room.description}</p> : null}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {room.membersCount} members
        </div>
        <Button onClick={() => onToggleJoin(room.id)} variant={room.isJoined ? "outline" : "default"} size="sm">
          {room.isJoined ? "Joined" : "Join"}
        </Button>
      </div>
    </div>
  );
}
