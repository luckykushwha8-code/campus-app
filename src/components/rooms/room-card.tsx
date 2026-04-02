"use client";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Hash, Lock } from "lucide-react";

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    description?: string;
    type: string;
    membersCount: number;
    isJoined: boolean;
    lastActivity?: string;
  };
}

export function RoomCard({ room }: RoomCardProps) {
  const typeIcons: Record<string, string> = {
    college: "🎓",
    school: "🏫",
    hostel: "🏠",
    department: "📚",
    class: "👥",
    event: "🎉",
    club: "🎯",
    study: "📖",
    placement: "💼",
    internship: "🚀",
    buysell: "🛒",
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeIcons[room.type] || "💬"}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{room.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Hash className="h-3 w-3" />
              {room.type}
            </div>
          </div>
        </div>
        {!room.isJoined && (
          <Badge variant="secondary">
            <Lock className="h-3 w-3 mr-1" />
            Private
          </Badge>
        )}
      </div>

      {room.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{room.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {room.membersCount} members
        </div>
        <Button variant={room.isJoined ? "outline" : "default"} size="sm">
          {room.isJoined ? "Joined" : "Join"}
        </Button>
      </div>
    </div>
  );
}
