"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, Users, Calendar, GraduationCap, FileText, Flame, Shield } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";

const quickLinks = [
  { href: "/", icon: Home, label: "Feed" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/rooms", icon: Users, label: "Rooms" },
];

const categories = [
  { href: "/notes", icon: FileText, label: "Notes" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/clubs", icon: GraduationCap, label: "Clubs" },
];

const trendingTopics = [
  { name: "#Hackathon2025", posts: "2.3K" },
  { name: "#PlacementSeason", posts: "1.8K" },
  { name: "#MidSemester", posts: "945" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppSession();

  return (
    <aside className="hidden w-[268px] shrink-0 lg:block">
      <div className="sticky top-24 space-y-5">
        <nav className="app-surface p-3">
          <div className="space-y-1">
            {quickLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
                    isActive ? "bg-[var(--bg-secondary)] font-semibold text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <section className="app-surface p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Campus tools</p>
          <div className="space-y-1">
            {categories.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
                    isActive ? "bg-[var(--bg-secondary)] font-semibold text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {user?.role === "admin" ? (
          <section className="app-surface p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Admin</p>
            <Link
              href="/moderation"
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
                pathname === "/moderation"
                  ? "bg-[var(--bg-secondary)] font-semibold text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span>Moderation</span>
            </Link>
          </section>
        ) : null}

        <section className="app-surface p-4">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Trending</h3>
          </div>
          <div className="space-y-2">
            {trendingTopics.map((topic) => (
              <Link key={topic.name} href={`/explore?hashtag=${topic.name}`} className="app-panel flex items-center justify-between px-3 py-3 text-sm hover:bg-[var(--bg-tertiary)]">
                <span className="font-medium text-[var(--text-primary)]">{topic.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{topic.posts}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
