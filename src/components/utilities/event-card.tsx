"use client";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    location?: string;
    startDate: string;
    organizer: { name: string; avatar?: string };
    attendees: number;
    isRegistered: boolean;
  };
  onToggleRegistration?: (eventId: string) => void;
}

export function EventCard({ event, onToggleRegistration }: EventCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {event.image && (
        <Image src={event.image} alt={event.title} className="w-full h-40 object-cover" width={800} height={320} />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{event.title}</h3>
        {event.description && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{event.description}</p>
        )}
        
        <div className="mt-3 space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(event.startDate)}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {event.attendees} attending
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar alt={event.organizer.name} src={event.organizer.avatar} />
            <span className="text-sm text-gray-600">{event.organizer.name}</span>
          </div>
          <Button variant={event.isRegistered ? "outline" : "default"} size="sm" onClick={() => onToggleRegistration?.(event.id)}>
            {event.isRegistered ? "Registered" : "Register"}
          </Button>
        </div>
      </div>
    </div>
  );
}
