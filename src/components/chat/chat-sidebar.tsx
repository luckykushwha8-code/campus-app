"use client";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

const conversations = [
  {
    id: "1",
    name: "CSE 2025 Group",
    avatar: null,
    lastMessage: "Hey, anyone has notes for DBMS?",
    time: "2m",
    unread: 3,
    isGroup: true,
  },
  {
    id: "2",
    name: "Rahul Sharma",
    avatar: null,
    lastMessage: "Sure, I'll share it tomorrow",
    time: "1h",
    unread: 0,
    isGroup: false,
  },
  {
    id: "3",
    name: "Tech Club",
    avatar: null,
    lastMessage: "Meeting at 5pm today",
    time: "3h",
    unread: 1,
    isGroup: true,
  },
  {
    id: "4",
    name: "Priya Patel",
    avatar: null,
    lastMessage: "Thanks!",
    time: "Yesterday",
    unread: 0,
    isGroup: false,
  },
];

export function ChatSidebar() {
  return (
    <div className="w-full md:w-80 border-r border-[var(--border-color)] bg-[var(--bg-primary)] h-full flex flex-col">
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-title font-semibold text-[var(--text-primary)]">Messages</h1>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input placeholder="Search messages..." className="input-clean pl-9" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-3 p-3 rounded-md border-[var(--border-color)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Avatar alt={conv.name} className="h-10 w-10" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-[var(--text-primary)] truncate">{conv.name}</span>
                <span className="text-caption text-[var(--text-muted)]">{conv.time}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] truncate">{conv.lastMessage}</p>
            </div>
            {conv.unread > 0 && (
              <Badge variant="secondary" className="text-xs">
                {conv.unread}
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}