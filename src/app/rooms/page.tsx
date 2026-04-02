import { RoomList } from "@/components/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export default function RoomsPage() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campus Rooms</h1>
          <p className="text-gray-600">Join rooms to connect with your campus community</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Room
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search rooms..." className="pl-9" />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Your Rooms</h2>
        <RoomList />
      </div>
    </div>
  );
}
