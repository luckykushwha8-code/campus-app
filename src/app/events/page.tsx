import { EventCard } from "@/components/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Calendar, MapPin, Filter } from "lucide-react";
import { formatRelative } from "date-fns";

const mockEvents = [
  {
    id: "1",
    title: "Hackathon 2025",
    description: "24-hour coding competition with exciting prizes. Form your teams and participate!",
    image: "https://picsum.photos/seed/event1/600/400",
    location: "Main Auditorium, NIT Trichy",
    startDate: formatRelative(new Date(Date.now() + 86400000 * 7), new Date()),
    organizer: { name: "Tech Club" },
    attendees: 156,
    isRegistered: false,
  },
  {
    id: "2",
    title: "Cultural Fest 2025",
    description: "Annual cultural festival with dance, music, and drama performances",
    image: "https://picsum.photos/seed/event2/600/400",
    location: "Open Air Theatre",
    startDate: formatRelative(new Date(Date.now() + 86400000 * 14), new Date()),
    organizer: { name: "Cultural Club" },
    attendees: 423,
    isRegistered: true,
  },
  {
    id: "3",
    title: "Workshop on AI/ML",
    description: "Hands-on workshop on Machine Learning fundamentals using Python",
    image: "https://picsum.photos/seed/event3/600/400",
    location: "Computer Science Building",
    startDate: formatRelative(new Date(Date.now() + 86400000 * 3), new Date()),
    organizer: { name: "AI Club" },
    attendees: 67,
    isRegistered: false,
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-title font-semibold text-[var(--text-primary)] mb-2">Campus Events</h1>
            <p className="text-caption text-[var(--text-muted)]">Discover and register for campus events</p>
          </div>
          <Button className="button-outline gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <Input placeholder="Search events..." className="input-clean pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2 gap-1 mb-6">
            <TabsTrigger value="upcoming" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Ongoing</TabsTrigger>
            <TabsTrigger value="past" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Past</TabsTrigger>
            <TabsTrigger value="my" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">My Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid gap-4">
              <div className="sm:grid-cols-2 lg:grid-cols-3">
                {mockEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ongoing">
            <div className="text-center py-12">
              <p className="text-caption text-[var(--text-muted)]">Ongoing events will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="past">
            <div className="text-center py-12">
              <p className="text-caption text-[var(--text-muted)]">Past events will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="my">
            <div className="text-center py-12">
              <p className="text-caption text-[var(--text-muted)]">Your registered events will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}