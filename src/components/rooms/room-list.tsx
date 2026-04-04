"use client";

import { RoomCard, RoomCardData } from "./room-card";

interface RoomListProps {
  rooms: RoomCardData[];
  onToggleJoin: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
  pendingRoomId?: string | null;
  deletingRoomId?: string | null;
}

export function RoomList({ rooms, onToggleJoin, onDelete, pendingRoomId, deletingRoomId }: RoomListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onToggleJoin={onToggleJoin}
          onDelete={onDelete}
          isJoining={pendingRoomId === room.id}
          isDeleting={deletingRoomId === room.id}
        />
      ))}
    </div>
  );
}
