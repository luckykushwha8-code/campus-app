"use client";
import { RoomCard } from "./room-card";

const rooms = [
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

export function RoomList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
