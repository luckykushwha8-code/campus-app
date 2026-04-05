"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { EventCard } from "@/components/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, CalendarDays } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";

type EventItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  startDate: string;
  organizer: { id?: string; name: string; avatar?: string };
  attendees: number;
  isRegistered: boolean;
  isOwner?: boolean;
};

type EventForm = {
  title: string;
  location: string;
  startDate: string;
  description: string;
  image: string;
};

const emptyForm: EventForm = {
  title: "",
  location: "",
  startDate: "",
  description: "",
  image: "",
};

export default function EventsPage() {
  const { isAuthenticated, token } = useAppSession();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/events", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to load events right now.");
        setEvents([]);
        return;
      }
      setEvents(data.events || []);
      setFeedback("");
    } catch {
      setFeedback("Unable to load events right now.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const sorted = [...events].sort(
      (left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
    );
    if (!trimmed) return sorted;
    return sorted.filter((event) =>
      `${event.title} ${event.description} ${event.location} ${event.organizer.name}`
        .toLowerCase()
        .includes(trimmed)
    );
  }, [events, query]);

  const registeredEvents = filteredEvents.filter((event) => event.isRegistered);
  const upcomingEvents = filteredEvents.filter((event) => new Date(event.startDate).getTime() >= Date.now());
  const pastEvents = filteredEvents.filter((event) => new Date(event.startDate).getTime() < Date.now());

  async function toggleRegistration(eventId: string) {
    if (!token) {
      setFeedback("Please log in to register for events.");
      return;
    }

    setPendingEventId(eventId);
    setFeedback("");
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to update registration.");
        return;
      }
      setEvents((current) => current.map((event) => (event.id === eventId ? data.event : event)));
    } catch {
      setFeedback("Unable to update registration.");
    } finally {
      setPendingEventId(null);
    }
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setFeedback("Please log in to create events.");
      return;
    }

    setIsCreating(true);
    setFeedback("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to create event.");
        return;
      }

      setEvents((current) => [data.event, ...current]);
      setForm(emptyForm);
      setShowCreate(false);
      setFeedback("Event created and registered successfully.");
    } catch {
      setFeedback("Unable to create event.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!token) {
      setFeedback("Please log in to delete events.");
      return;
    }

    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) {
      return;
    }

    setDeletingEventId(eventId);
    setFeedback("");
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to delete event.");
        return;
      }

      setEvents((current) => current.filter((event) => event.id !== eventId));
      setFeedback("Event deleted successfully.");
    } catch {
      setFeedback("Unable to delete event.");
    } finally {
      setDeletingEventId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-title font-semibold text-[var(--text-primary)]">Campus Events</h1>
            <p className="text-caption text-[var(--text-muted)]">
              Register for events, track your plans, and create campus meetups that others can join.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreate((value) => !value)}>
            <Plus className="h-4 w-4" />
            {showCreate ? "Close" : "Create Event"}
          </Button>
        </div>

        {!isAuthenticated ? (
          <div className="mb-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-4 text-sm text-[var(--text-secondary)]">
            Sign in to register for events or publish your own.
          </div>
        ) : null}

        {feedback ? (
          <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
            {feedback}
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              placeholder="Search events, organizers, or places..."
              className="input-clean pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-2 text-sm text-[var(--text-secondary)]">
            <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
            {registeredEvents.length} registered
          </div>
        </div>

        {showCreate ? (
          <form
            className="mb-6 grid gap-4 rounded-[28px] border border-[var(--border-color)] bg-white p-5 shadow-[0_18px_60px_rgba(17,24,39,0.05)]"
            onSubmit={handleCreateEvent}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Event title</label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Campus startup pitch night"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Location</label>
                <Input
                  value={form.location}
                  onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  placeholder="Innovation Lab"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Date and time</label>
                <Input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Cover image URL</label>
                <Input
                  value={form.image}
                  onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Description</label>
              <textarea
                className="input-clean min-h-[120px] w-full resize-none"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Tell students what to expect"
              />
            </div>
            <div className="flex gap-3">
              <button className="button-clean" disabled={isCreating} type="submit">
                {isCreating ? "Publishing..." : "Publish event"}
              </button>
              <button className="button-outline" type="button" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {isLoading ? (
          <div className="rounded-[28px] border border-dashed border-[var(--border-color)] bg-white px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
            Loading events...
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="my">My Events</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <EventGrid events={upcomingEvents} onToggleRegistration={toggleRegistration} onDeleteEvent={handleDeleteEvent} pendingEventId={pendingEventId} deletingEventId={deletingEventId} emptyMessage="No upcoming events match your search yet." />
            </TabsContent>

            <TabsContent value="my">
              <EventGrid events={registeredEvents} onToggleRegistration={toggleRegistration} onDeleteEvent={handleDeleteEvent} pendingEventId={pendingEventId} deletingEventId={deletingEventId} emptyMessage="Register for an event and it will show up here." />
            </TabsContent>

            <TabsContent value="all">
              <EventGrid events={filteredEvents} onToggleRegistration={toggleRegistration} onDeleteEvent={handleDeleteEvent} pendingEventId={pendingEventId} deletingEventId={deletingEventId} emptyMessage="No events found. Try another search or create one." />
            </TabsContent>

            <TabsContent value="past">
              <EventGrid events={pastEvents} onToggleRegistration={toggleRegistration} onDeleteEvent={handleDeleteEvent} pendingEventId={pendingEventId} deletingEventId={deletingEventId} emptyMessage="Past events will show up here after their date passes." />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function EventGrid({
  events,
  onToggleRegistration,
  onDeleteEvent,
  pendingEventId,
  deletingEventId,
  emptyMessage,
}: {
  events: EventItem[];
  onToggleRegistration: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  pendingEventId: string | null;
  deletingEventId: string | null;
  emptyMessage: string;
}) {
  if (!events.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-[var(--border-color)] bg-white px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onToggleRegistration={onToggleRegistration}
          onDelete={onDeleteEvent}
          isSaving={pendingEventId === event.id}
          isDeleting={deletingEventId === event.id}
        />
      ))}
    </div>
  );
}
