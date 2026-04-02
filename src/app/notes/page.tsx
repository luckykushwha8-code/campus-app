import { NoteCard } from "@/components/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Filter } from "lucide-react";
import { formatRelative } from "date-fns";

const mockNotes = [
  {
    id: "1",
    title: "DBMS Unit 1 Notes",
    description: "Complete notes covering Entity-Relationship model and Relational Algebra",
    subject: "DBMS",
    uploadedBy: { name: "Rahul Sharma" },
    downloads: 234,
    views: 567,
    createdAt: formatRelative(new Date(Date.now() - 86400000), new Date()),
  },
  {
    id: "2",
    title: "OS Complete Notes",
    description: "Operating System fundamentals - Process, Memory, File systems",
    subject: "Operating Systems",
    uploadedBy: { name: "Priya Patel" },
    downloads: 456,
    views: 890,
    createdAt: formatRelative(new Date(Date.now() - 172800000), new Date()),
  },
  {
    id: "3",
    title: "DAA Previous Year Questions",
    description: "Solved problems from past exams",
    subject: "DAA",
    uploadedBy: { name: "Amit Kumar" },
    downloads: 178,
    views: 345,
    createdAt: formatRelative(new Date(Date.now() - 259200000), new Date()),
  },
];

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-title font-semibold text-[var(--text-primary)] mb-2">Class Notes</h1>
            <p className="text-caption text-[var(--text-muted)]">Share and access study materials</p>
          </div>
          <Button className="button-outline gap-2">
            <Upload className="h-4 w-4" />
            Upload Notes
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <Input placeholder="Search notes by subject or topic..." className="input-clean pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 gap-1 mb-6">
            <TabsTrigger value="all" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">All Notes</TabsTrigger>
            <TabsTrigger value="popular" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Popular</TabsTrigger>
            <TabsTrigger value="recent" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Recent</TabsTrigger>
            <TabsTrigger value="my" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">My Uploads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              <div className="sm:grid-cols-2 lg:grid-cols-3">
                {mockNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="popular">
            <div className="text-center py-12">
              <p className="text-caption text-[var(--text-muted)]">Popular notes will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="text-center py-12">
              <p className="text-caption text-[var(--text-muted)]">Recent notes will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="my">
            <div className="text-center py-12">
              <p className="text-caption text-[var(--text-muted)]">Your uploaded notes will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}