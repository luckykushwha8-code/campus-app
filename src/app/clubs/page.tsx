import { ClubCard } from "@/components/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Users, Star } from "lucide-react";

const mockClubs = [
  {
    id: "1",
    name: "Tech Club",
    description: "Coding, development, and technology enthusiasts. We organize hackathons, workshops, and coding contests.",
    logo: "https://picsum.photos/seed/club1/100/100",
    membersCount: 234,
    isMember: true,
  },
  {
    id: "2",
    name: "Cultural Club",
    description: "Arts, music, dance, and cultural events. The heart of campus creativity.",
    logo: "https://picsum.photos/seed/club2/100/100",
    membersCount: 189,
    isMember: false,
  },
  {
    id: "3",
    name: "Sports Club",
    description: "All sports activities and tournaments. Stay fit and compete!",
    logo: "https://picsum.photos/seed/club3/100/100",
    membersCount: 312,
    isMember: true,
  },
  {
    id: "4",
    name: "Photography Club",
    description: "Capture moments and learn photography skills.",
    logo: "https://picsum.photos/seed/club4/100/100",
    membersCount: 156,
    isMember: false,
  },
  {
    id: "5",
    name: "AI/ML Club",
    description: "Artificial Intelligence and Machine Learning enthusiasts.",
    logo: "https://picsum.photos/seed/club5/100/100",
    membersCount: 178,
    isMember: false,
  },
  {
    id: "6",
    name: "Literary Club",
    description: "Debates, quizzes, writing, and literature appreciation.",
    logo: "https://picsum.photos/seed/club6/100/100",
    membersCount: 98,
    isMember: false,
  },
];

export default function ClubsPage() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clubs & Societies</h1>
          <p className="text-gray-600">Join clubs and be part of campus communities</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Club
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Clubs</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
