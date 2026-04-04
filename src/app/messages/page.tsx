"use client";

import Link from "next/link";
import { ChatSidebar, ChatWindow } from "@/components/chat";
import { useAppSession } from "@/hooks/use-app-session";

export default function MessagesPage() {
  const { isAuthenticated } = useAppSession();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--border-color)] bg-white p-8 text-center shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <p className="text-sm font-medium text-[var(--accent)]">Messages locked</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Sign in to open your campus inbox</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Login to access room chats, direct messages, and updates from your communities.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link className="button-clean" href="/login">
              Login
            </Link>
            <Link className="button-outline" href="/signup">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <ChatWindow
        conversationId="1"
        conversationName="CSE 2025 Group"
        isGroup={true}
      />
    </div>
  );
}
