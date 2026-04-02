"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Compass,
  MessageSquare,
  Users,
  BookOpen,
  Calendar,
  Briefcase,
  ShoppingBag,
  Search,
  GraduationCap,
  Plus,
  Hash,
  TrendingUp,
  Flame,
} from "lucide-react";

const quickLinks = [
  { href: "/", icon: Home, label: "Feed" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/messages", icon: MessageSquare, label: "Messages", badge: 3 },
  { href: "/rooms", icon: Users, label: "Rooms" },
];

const categories = [
  { href: "/notes", icon: BookOpen, label: "Notes" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/placements", icon: Briefcase, label: "Placements" },
  { href: "/marketplace", icon: ShoppingBag, label: "Buy/Sell" },
  { href: "/lost-found", icon: Search, label: "Lost & Found" },
  { href: "/clubs", icon: GraduationCap, label: "Clubs" },
];

const trendingTopics = [
  { name: "#Hackathon2025", posts: "2.3K" },
  { name: "#PlacementSeason", posts: "1.8K" },
  { name: "#MidSemester", posts: "945" },
  { name: "#TechClub", posts: "720" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-72 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
        {/* Logo */}
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="text-title font-semibold text-[var(--text-primary)]">Campus</span>
          </Link>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              className="input-clean w-full pl-10 py-2 text-body"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-6">
          <div className="space-y-2">
            {quickLinks.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-[var(--bg-secondary)] text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Campus Life */}
        <div className="mb-6">
          <h3 className="text-caption font-semibold text-[var(--text-muted)] uppercase mb-3">Campus Life</h3>
          <div className="space-y-1">
            {categories.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-[var(--bg-secondary)] text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Trending */}
        <div className="mb-6 p-3 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="text-caption font-semibold text-[var(--text-primary)]">Trending on Campus</h3>
          </div>
          <div className="space-y-2">
            {trendingTopics.map((topic) => (
              <Link
                key={topic.name}
                href={`/explore?hashtag=${topic.name}`}
                className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <span className="text-[var(--text-primary)]">{topic.name}</span>
                <span className="text-caption text-[var(--text-muted)]">{topic.posts} posts</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Rooms */}
        <div className="mb-6">
          <h3 className="text-caption font-semibold text-[var(--text-muted)] uppercase mb-3">Popular Rooms</h3>
          <div className="space-y-1">
            {["CSE 2025", "Hostel A", "Tech Club", "Placement Cell"].map((room) => (
              <Link
                key={room}
                href={`/rooms/${room.toLowerCase().replace(/\s/g, "-")}`}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <Hash className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                <span className="flex-1">{room}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <button className="w-full py-2 rounded-md button-outline">
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-body">Create Room</span>
        </button>
        
        {/* Footer Links */}
        <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
            <a href="#" className="hover:text-[var(--text-primary)]">About</a>
            <a href="#" className="hover:text-[var(--text-primary)]">Help</a>
            <a href="#" className="hover:text-[var(--text-primary)]">Privacy</a>
            <a href="#" className="hover:text-[var(--text-primary)]">Terms</a>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">© 2025 Campus</p>
        </div>
      </div>
    </aside>
  );
}