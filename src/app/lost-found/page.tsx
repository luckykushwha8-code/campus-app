import { LostItemCard } from "@/components/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, AlertCircle, Filter } from "lucide-react";
import { formatRelative } from "date-fns";

const mockItems = [
  {
    id: "1",
    title: "Lost: Blue Backpack",
    description: "Left in the library yesterday. Contains laptop and notebooks.",
    image: "https://picsum.photos/seed/lost1/400/300",
    location: "Central Library, 2nd Floor",
    status: "lost",
    postedBy: { name: "Rahul Sharma" },
    createdAt: formatRelative(new Date(Date.now() - 3600000 * 5), new Date()),
  },
  {
    id: "2",
    title: "Found: Keys with Keychain",
    description: "Found near the cafeteria. Has a red keychain.",
    image: "https://picsum.photos/seed/found1/400/300",
    location: "Cafeteria Area",
    status: "found",
    postedBy: { name: "Priya Patel" },
    createdAt: formatRelative(new Date(Date.now() - 86400000), new Date()),
  },
  {
    id: "3",
    title: "Lost: Water Bottle",
    description: "Blue stainless steel water bottle, very important!",
    image: "https://picsum.photos/seed/lost2/400/300",
    location: "Sports Complex",
    status: "lost",
    postedBy: { name: "Amit Kumar" },
    createdAt: formatRelative(new Date(Date.now() - 86400000 * 2), new Date()),
  },
];

export default function LostFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-title font-semibold text-[var(--text-primary)] mb-2">Lost & Found</h1>
            <p className="text-caption text-[var(--text-muted)]">Report lost items or claim found ones</p>
          </div>
          <Button className="button-outline gap-2">
            <Plus className="h-4 w-4" />
            Report Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--accent)]/10 rounded-xl p-4 text-[var(--accent)]">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Lost Items</span>
            </div>
            <p className="text-body font-medium">12</p>
          </div>
          <div className="bg-[var(--accent)]/10 rounded-xl p-4 text-[var(--accent)]">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5" />
              <span className="font-semibold">Found Items</span>
            </div>
            <p className="text-body font-medium">8</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <Input placeholder="Search items..." className="input-clean pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 gap-1 mb-6">
            <TabsTrigger value="all" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">All Items</TabsTrigger>
            <TabsTrigger value="lost" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Lost</TabsTrigger>
            <TabsTrigger value="found" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Found</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              <div className="sm:grid-cols-2 lg:grid-cols-3">
                {mockItems.map((item) => (
                  <LostItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="lost">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-caption text-[var(--text-muted)]">Lost items will appear here</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="found">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-caption text-[var(--text-muted)]">Found items will appear here</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}