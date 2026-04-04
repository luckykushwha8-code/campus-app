"use client";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, ArrowRight, Trash2 } from "lucide-react";

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
    isOwner?: boolean;
  };
  onToggleRegistration?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export function EventCard({ event, onToggleRegistration, onDelete, isSaving, isDeleting }: EventCardProps) {
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
          <div className="flex items-center gap-2">
            <Link href={`/events/${event.id}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50">
              Open
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Button variant={event.isRegistered ? "outline" : "default"} size="sm" onClick={() => onToggleRegistration?.(event.id)} disabled={isSaving}>
              {isSaving ? "Saving..." : event.isRegistered ? "Leave" : "Register"}
            </Button>
            {event.isOwner && onDelete ? (
              <button
                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                onClick={() => onDelete(event.id)}
                disabled={isDeleting}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
