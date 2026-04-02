"use client";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelative } from "date-fns";
import { Send, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";

const messages = [
  {
    id: "1",
    content: "Hey, anyone has notes for DBMS?",
    senderId: "user2",
    createdAt: formatRelative(new Date(Date.now() - 3600000 * 2), new Date()),
  },
  {
    id: "2",
    content: "Yes, I have! Will share after class",
    senderId: "user1",
    createdAt: formatRelative(new Date(Date.now() - 3600000), new Date()),
  },
  {
    id: "3",
    content: "Can you also share the previous year papers?",
    senderId: "user2",
    createdAt: formatRelative(new Date(Date.now() - 1800000), new Date()),
  },
  {
    id: "4",
    content: "Sure, I'll share it tomorrow",
    senderId: "user1",
    createdAt: formatRelative(new Date(Date.now() - 600000), new Date()),
  },
];

interface ChatWindowProps {
  conversationId: string;
  conversationName: string;
  isGroup?: boolean;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, conversationName, isGroup, onBack }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Avatar alt={conversationName} className="h-10 w-10" />
          <div>
            <h2 className="text-body font-medium text-[var(--text-primary)]">{conversationName}</h2>
            <p className="text-caption text-[var(--text-muted)]">{isGroup ? "24 members" : "Online"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId === "user1";
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-xl px-4 py-2 ${
                  isOwn
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                }`}
              >
                <p className="text-body whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-caption mt-1 ${
                    isOwn ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {msg.createdAt}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[var(--border-color)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) setInput("");
          }}
          className="flex items-center gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-clean"
          />
          <Button type="submit" size="icon" variant="outline">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}