"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAppSession } from "@/hooks/use-app-session";
import { Home, Compass, Plus, MessageSquare, User, Search, FileText, Camera, Bell, Sparkles } from "lucide-react";

const mobileNavItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Search" },
  { href: "#create", icon: Plus, label: "Create", isCreate: true },
  { href: "/messages", icon: MessageSquare, label: "Inbox" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const { user, logout } = useAppSession();

  function handleLogout() {
    logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/92 backdrop-blur-xl">
        <div className="app-frame flex h-16 items-center gap-3 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0f172a_100%)] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.14em] text-[var(--accent)]">CAMPUSLINK</p>
              <p className="text-xs text-[var(--text-muted)]">Student-first social</p>
            </div>
          </Link>

          <Link href="/explore" className="app-panel ml-auto hidden min-w-0 items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] md:flex md:w-full md:max-w-md">
            <Search className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
            <span className="truncate">Search students, clubs, rooms, and events</span>
          </Link>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link href="/explore" className="app-panel flex h-11 w-11 items-center justify-center text-[var(--text-secondary)] md:hidden">
              <Search className="h-4 w-4" />
            </Link>
            <button className="button-clean hidden md:inline-flex" onClick={() => setShowCreate(true)} type="button">
              <Plus className="h-4 w-4" />
              Create
            </button>
            <Link href="/notifications" className="app-panel flex h-11 w-11 items-center justify-center text-[var(--text-secondary)]">
              <Bell className="h-4 w-4" />
            </Link>
            <Link href="/profile">
              <Avatar alt={user?.name || "User"} src={user?.avatarUrl} className="h-11 w-11 border border-[var(--border-color)]" />
            </Link>
          </div>
        </div>
      </header>

      <nav className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/96 backdrop-blur-xl lg:hidden">
        <div className="app-frame flex h-16 items-center justify-around px-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href !== "#create" && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));

            if (item.isCreate) {
              return (
                <button key={item.label} onClick={() => setShowCreate(true)} className="button-clean -mt-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" type="button">
                  <Icon className="h-5 w-5" />
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("flex min-w-[60px] flex-col items-center gap-1 text-xs transition-colors", isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]")}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {showCreate ? (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-xl rounded-t-[28px] border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border-light)]" />
            <div className="mb-3">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Create something</h3>
              <p className="text-sm text-[var(--text-secondary)]">One clear place for posting, stories, and anonymous sharing.</p>
            </div>
            <div className="space-y-3">
              <CreateAction href="/" icon={FileText} title="New post" description="Share an update with your campus" onClick={() => setShowCreate(false)} />
              <CreateAction href="/" icon={Camera} title="Story" description="Add a quick visual moment" onClick={() => setShowCreate(false)} />
              <CreateAction href="/" icon={User} title="Anonymous note" description="Post privately without your identity" onClick={() => setShowCreate(false)} />
            </div>
            <div className="mt-4 flex gap-3">
              <button className="button-outline flex-1" onClick={() => setShowCreate(false)} type="button">
                Close
              </button>
              <button className="button-ghost" onClick={handleLogout} type="button">
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CreateAction({
  href,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  href: string;
  icon: typeof FileText;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} className="app-panel flex items-center gap-4 px-4 py-4 hover:bg-[var(--bg-tertiary)]" onClick={onClick}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
    </Link>
  );
}
