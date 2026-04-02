"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  Home,
  Compass,
  Plus,
  MessageSquare,
  Bell,
  User,
  Search,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/", icon: Plus, label: "Create", isCreate: true },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {/* Top Bar - Desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden md:block bg-[var(--bg-primary)]/90 backdrop-blur-[2px] border-b-[var(--border-color)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-title font-semibold text-[var(--text-primary)]">Campus</span>
          </Link>
          
          <div className="relative flex-max w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="input-clean w-full pl-10 py-2 text-body"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors">
              <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
            </Link>
            <Link href="/profile">
              <Avatar alt="User" className="h-9 w-9" />
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Clean Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 hidden md:block bg-[var(--bg-primary)]/90 backdrop-blur-[2px] border-t-[var(--border-color)] safe-area-bottom">
        <div className="flex items-center justify-around h-12 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            if (item.isCreate) {
              return (
                <button
                  key={item.href}
                  onClick={() => setShowCreate(true)}
                  className="flex items-center justify-center p-1"
                >
                  <button className="button-clean w-10 h-10 rounded-md flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </button>
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
                <Icon 
                  className="h-5 w-5"
                />
                <span className="text-caption mt-[var(--spacing-1)]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Create Modal - Clean Style */}
      {showCreate && (
        <div 
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCreate(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-xl animate-slide-up border-t-[var(--border-color)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--border-color)]">
              <div className="w-10 h-0.5 bg-[var(--border-light)] rounded-full mx-auto mb-3" />
              <h3 className="text-title font-semibold text-center text-[var(--text-primary)]">Create</h3>
            </div>
            <div className="p-4 space-y-3">
              <Link 
                href="/" 
                className="flex items-center gap-3 p-3 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => setShowCreate(false)}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center bg-[var(--bg-secondary)]">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <p className="text-body font-medium text-[var(--text-primary)]">Post</p>
                  <p className="text-caption text-[var(--text-muted)]">Share with your campus</p>
                </div>
              </Link>
              <Link 
                href="/" 
                className="flex items-center gap-3 p-3 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => setShowCreate(false)}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center bg-[var(--bg-secondary)]">
                  <span className="text-xl">📸</span>
                </div>
                <div>
                  <p className="text-body font-medium text-[var(--text-primary)]">Story</p>
                  <p className="text-caption text-[var(--text-muted)]">Share to your story</p>
                </div>
              </Link>
              <Link 
                href="/" 
                className="flex items-center gap-3 p-3 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => setShowCreate(false)}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center bg-[var(--bg-secondary)]">
                  <span className="text-xl">🎭</span>
                </div>
                <div>
                  <p className="text-body font-medium text-[var(--text-primary)]">Anonymous</p>
                  <p className="text-caption text-[var(--text-muted)]">Share anonymously</p>
                </div>
              </Link>
            </div>
            <div className="p-4 pb-6">
              <button 
                onClick={() => setShowCreate(false)}
                className="w-full py-2 rounded-md button-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}