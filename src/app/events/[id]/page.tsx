"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Users, Trash2 } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";
import { formatDate } from "@/lib/utils";

type EventDetail = {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  startDate: string;
  organizer: { name: string; avatar?: string };
  attendees: number;
  isRegistered: boolean;
  isOwner: boolean;
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAppSession();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/events/${params.id}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          setStatus(data.error || "Unable to load this event.");
          setEvent(null);
          return;
        }

        setEvent(data.event);
        setStatus("");
      } catch {
        setStatus("Unable to load this event.");
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      loadEvent();
    }
  }, [params.id, token]);

  async function handleRegistration() {
    if (!token || !event) {
      setStatus("Please log in to register for events.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: event.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to update registration.");
        return;
      }

      setEvent(data.event);
      setStatus(data.event.isRegistered ? "You are registered for this event." : "You left this event.");
    } catch {
      setStatus("Unable to update registration.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !event?.isOwner) {
      return;
    }

    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to delete this event.");
        return;
      }

      router.push("/events");
      router.refresh();
    } catch {
      setStatus("Unable to delete this event.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Link href="/events" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      {status ? (
        <div className="mb-4 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
          {status}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-3xl border border-[var(--border-color)] bg-white p-6 text-sm text-[var(--text-secondary)]">
          Loading event...
        </div>
      ) : event ? (
        <div className="overflow-hidden rounded-3xl border border-[var(--border-color)] bg-white shadow-sm">
          {event.image ? (
            <Image src={event.image} alt={event.title} className="h-64 w-full object-cover" width={1400} height={500} />
          ) : null}
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-[var(--text-primary)]">{event.title}</h1>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{event.description || "No event description yet."}</p>
              </div>
              <div className="flex gap-2">
                <button className={event.isRegistered ? "button-outline" : "button-clean"} disabled={isSaving} onClick={handleRegistration} type="button">
                  {isSaving ? "Saving..." : event.isRegistered ? "Leave event" : "Register"}
                </button>
                {event.isOwner ? (
                  <button className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600" disabled={isSaving} onClick={handleDelete} type="button">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">When</p>
                <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(event.startDate)}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Location</p>
                <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Attendees</p>
                <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
                  <Users className="h-4 w-4" />
                  {event.attendees}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--border-color)] bg-white p-6 text-sm text-[var(--text-secondary)]">
          This event could not be found.
        </div>
      )}
    </div>
  );
}
