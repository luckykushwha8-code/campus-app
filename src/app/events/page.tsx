"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  organizer: { name: string; avatar?: string };
  attendees: number;
  isRegistered: boolean;
};

type EventForm = {
  title: string;
  location: string;
  startDate: string;
  description: string;
};

const emptyForm: EventForm = {
  title: "",
  location: "",
  startDate: "",
  description: "",
};

export default function EventsPage() {
  const { isAuthenticated } = useAppSession();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadEvents() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to load events right now.");
        return;
      }
      setEvents(data.events || []);
    } catch {
      setFeedback("Unable to load events right now.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

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
    setFeedback("");
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    }
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Location</label>
                <Input
                  value={form.location}
                  onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  placeholder="Innovation Lab"
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
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Description</label>
                <Input
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Tell students what to expect"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="button-clean" type="submit">
                Publish event
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
              <EventGrid events={upcomingEvents} onToggleRegistration={toggleRegistration} emptyMessage="No upcoming events match your search yet." />
            </TabsContent>

            <TabsContent value="my">
              <EventGrid events={registeredEvents} onToggleRegistration={toggleRegistration} emptyMessage="Register for an event and it will show up here." />
            </TabsContent>

            <TabsContent value="all">
              <EventGrid events={filteredEvents} onToggleRegistration={toggleRegistration} emptyMessage="No events found. Try another search or create one." />
            </TabsContent>

            <TabsContent value="past">
              <EventGrid events={pastEvents} onToggleRegistration={toggleRegistration} emptyMessage="Past events will show up here after their date passes." />
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
  emptyMessage,
}: {
  events: EventItem[];
  onToggleRegistration: (eventId: string) => void;
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
        <EventCard key={event.id} event={event} onToggleRegistration={onToggleRegistration} />
      ))}
    </div>
  );
}
