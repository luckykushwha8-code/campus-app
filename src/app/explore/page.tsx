import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomList } from "@/components/rooms";
import { ClubCard } from "@/components/utilities";
import { EventCard } from "@/components/utilities";
import { formatRelative } from "date-fns";

const mockClubs = [
  {
    id: "1",
    name: "Tech Club",
    description: "Coding, development, and technology enthusiasts",
    membersCount: 234,
    isMember: true,
  },
  {
    id: "2",
    name: "Cultural Club",
    description: "Arts, music, and cultural events",
    membersCount: 189,
    isMember: false,
  },
  {
    id: "3",
    name: "Sports Club",
    description: "All sports activities and tournaments",
    membersCount: 312,
    isMember: true,
  },
];

const mockEvents = [
  {
    id: "1",
    title: "Hackathon 2025",
    description: "24-hour coding competition with exciting prizes",
    image: "https://picsum.photos/seed/event1/600/400",
    location: "Main Auditorium",
    startDate: formatRelative(new Date(Date.now() + 86400000 * 7), new Date()),
    organizer: { name: "Tech Club" },
    attendees: 156,
    isRegistered: false,
  },
  {
    id: "2",
    title: "Cultural Fest",
    description: "Annual cultural festival with performances",
    image: "https://picsum.photos/seed/event2/600/400",
    location: "Open Air Theatre",
    startDate: formatRelative(new Date(Date.now() + 86400000 * 14), new Date()),
    organizer: { name: "Cultural Club" },
    attendees: 423,
    isRegistered: true,
  },
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <h1 className="text-title font-semibold mb-6 text-[var(--text-primary)]">Explore</h1>
        
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid grid-cols-2 gap-1 mb-6">
            <TabsTrigger value="rooms" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Rooms</TabsTrigger>
            <TabsTrigger value="clubs" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Clubs</TabsTrigger>
            <TabsTrigger value="events" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Events</TabsTrigger>
            <TabsTrigger value="trends" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rooms" className="space-y-4">
            <RoomList />
          </TabsContent>
          
          <TabsContent value="clubs">
            <div className="grid gap-4">
              <div className="sm:grid-cols-2 lg:grid-cols-3">
                {mockClubs.map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={{ ...event, startDate: event.startDate }} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="text-center py-12">
              <p className="text-caption text-[var(--text-muted)]">Trending topics will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}