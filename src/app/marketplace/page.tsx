import { MarketplaceCard } from "@/components/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Tag, Filter } from "lucide-react";
import { formatRelative } from "date-fns";

const mockItems = [
  {
    id: "1",
    title: "DBMS Textbook - Korth",
    description: "Database System Concepts, 7th Edition. Condition: Like new",
    price: 450,
    images: ["https://picsum.photos/seed/book1/400/400"],
    category: "books",
    condition: "Like new",
    postedBy: { name: "Rahul Sharma" },
    createdAt: formatRelative(new Date(Date.now() - 86400000), new Date()),
  },
  {
    id: "2",
    title: "Scientific Calculator - Casio",
    description: "FX-991ES Plus, perfect for engineering exams",
    price: 800,
    images: ["https://picsum.photos/seed/calc1/400/400"],
    category: "electronics",
    condition: "Good",
    postedBy: { name: "Priya Patel" },
    createdAt: formatRelative(new Date(Date.now() - 172800000), new Date()),
  },
  {
    id: "3",
    title: "Data Structures Python Books Set",
    description: "Complete set of 3 books - CLRS, GFG, and Python DSA",
    price: 700,
    images: ["https://picsum.photos/seed/book2/400/400"],
    category: "books",
    condition: "Good",
    postedBy: { name: "Amit Kumar" },
    createdAt: formatRelative(new Date(Date.now() - 259200000), new Date()),
  },
  {
    id: "4",
    title: "Bluetooth Headphones - JBL",
    description: "JBL Tune 510BT, excellent sound quality",
    price: 1500,
    images: ["https://picsum.photos/seed/headphones1/400/400"],
    category: "electronics",
    condition: "Like new",
    postedBy: { name: "Sneha Gupta" },
    createdAt: formatRelative(new Date(Date.now() - 345600000), new Date()),
  },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-title font-semibold text-[var(--text-primary)] mb-2">Buy & Sell</h1>
            <p className="text-caption text-[var(--text-muted)]">Buy and sell items with your campus community</p>
          </div>
          <Button className="button-outline gap-2">
            <Plus className="h-4 w-4" />
            List Item
          </Button>
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
            <TabsTrigger value="all" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">All</TabsTrigger>
            <TabsTrigger value="books" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Books</TabsTrigger>
            <TabsTrigger value="electronics" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Electronics</TabsTrigger>
            <TabsTrigger value="others" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Others</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              <div className="sm:grid-cols-2 lg:grid-cols-4">
                {mockItems.map((item) => (
                  <MarketplaceCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="books">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-caption text-[var(--text-muted)]">Book listings will appear here</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="electronics">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-caption text-[var(--text-muted)]">Electronics listings will appear here</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="others">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-caption text-[var(--text-muted)]">Other listings will appear here</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}