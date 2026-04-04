"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAppSession } from "@/hooks/use-app-session";
import {
  Home,
  Compass,
  Plus,
  MessageSquare,
  Bell,
  User,
  Search,
  FileText,
  Camera,
} from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/", icon: Plus, label: "Create", isCreate: true },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const { user, isAuthenticated, logout } = useAppSession();

  function handleLogout() {
    logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 hidden border-b-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-[2px] md:block">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-title font-semibold text-[var(--text-primary)]">Campus</span>
          </Link>

          <div className="relative flex-max w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input type="text" placeholder="Search..." className="input-clean w-full pl-10 py-2 text-body" />
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="rounded-md border border-[var(--border-color)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                type="button"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signup"
                  className="rounded-md border border-[var(--border-color)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border border-[var(--border-color)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Login
                </Link>
              </div>
            )}
            <Link href="/notifications" className="rounded-md p-2 transition-colors hover:bg-[var(--bg-secondary)]">
              <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
            </Link>
            <Link href="/profile">
              <Avatar alt={user?.name || "User"} src={user?.avatarUrl} className="h-9 w-9" />
            </Link>
          </div>
        </div>
      </header>

      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 hidden border-t-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-[2px] md:block">
        <div className="flex h-12 items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            if (item.isCreate) {
              return (
                <button
                  key={item.href}
                  onClick={() => setShowCreate(true)}
                  className="flex items-center justify-center p-1"
                  type="button"
                >
                  <span className="button-clean flex h-10 w-10 items-center justify-center rounded-md">
                    <Icon className="h-5 w-5" />
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 transition-colors",
                  isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-[var(--spacing-1)] text-caption">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {showCreate && (
        <div
          className="animate-fade-in fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="animate-slide-up absolute bottom-0 left-0 right-0 rounded-t-xl border-t-[var(--border-color)] bg-[var(--bg-primary)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[var(--border-color)] p-4">
              <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-[var(--border-light)]" />
              <h3 className="text-center text-title font-semibold text-[var(--text-primary)]">Create</h3>
            </div>
            <div className="space-y-3 p-4">
              <CreateAction
                href="/"
                icon={FileText}
                title="Post"
                description="Share with your campus"
                onClick={() => setShowCreate(false)}
              />
              <CreateAction
                href="/"
                icon={Camera}
                title="Story"
                description="Share to your story"
                onClick={() => setShowCreate(false)}
              />
              <CreateAction
                href="/"
                icon={User}
                title="Anonymous"
                description="Share anonymously"
                onClick={() => setShowCreate(false)}
              />
            </div>
            <div className="p-4 pb-6">
              <button onClick={() => setShowCreate(false)} className="button-outline w-full rounded-md py-2" type="button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
    <Link href={href} className="flex items-center gap-3 rounded-md p-3 transition-colors hover:bg-[var(--bg-secondary)]" onClick={onClick}>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[var(--bg-secondary)]">
        <Icon className="h-5 w-5 text-[var(--accent)]" />
      </div>
      <div>
        <p className="text-body font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-caption text-[var(--text-muted)]">{description}</p>
      </div>
    </Link>
  );
}
