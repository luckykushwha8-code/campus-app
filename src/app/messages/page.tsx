"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSession } from "@/hooks/use-app-session";
import { Plus, Search, Send, Phone, Video, MoreVertical } from "lucide-react";

type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  isGroup: boolean;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
};

export default function MessagesPage() {
  const { isAuthenticated } = useAppSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/messages", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to load conversations.");
        return;
      }
      setConversations(data.conversations || []);
      if (!selectedConversationId && data.conversations?.length) {
        setSelectedConversationId(data.conversations[0].id);
      }
    } catch {
      setFeedback("Unable to load conversations.");
    }
  }, [selectedConversationId]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to load messages.");
        return;
      }
      setMessages(data.messages || []);
    } catch {
      setFeedback("Unable to load messages.");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !selectedConversationId) return;
    setFeedback("");

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConversationId, content: input }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to send message.");
        return;
      }
      setMessages((current) => [...current, data.message]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: data.message.content,
                time: data.message.createdAt,
              }
            : conversation
        )
      );
      setInput("");
    } catch {
      setFeedback("Unable to send message.");
    }
  }

  const filteredConversations = conversations.filter((conversation) =>
    `${conversation.name} ${conversation.lastMessage}`.toLowerCase().includes(search.trim().toLowerCase())
  );

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
    <div className="flex h-[calc(100vh-3.5rem)] bg-[var(--bg-primary)]">
      <div className="flex w-full max-w-sm flex-col border-r border-[var(--border-color)] bg-white">
        <div className="border-b border-[var(--border-color)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-title font-semibold text-[var(--text-primary)]">Messages</h1>
            <Button size="sm" variant="outline" type="button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              placeholder="Search messages..."
              className="input-clean pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[var(--bg-secondary)] ${
                selectedConversationId === conversation.id ? "bg-[var(--bg-secondary)]" : ""
              }`}
              onClick={() => setSelectedConversationId(conversation.id)}
              type="button"
            >
              <Avatar alt={conversation.name} src={conversation.avatar} className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-body font-medium text-[var(--text-primary)]">{conversation.name}</span>
                  <span className="text-caption text-[var(--text-muted)]">
                    {formatDistanceToNow(new Date(conversation.time), { addSuffix: true })}
                  </span>
                </div>
                <p className="truncate text-sm text-[var(--text-secondary)]">{conversation.lastMessage}</p>
              </div>
              {conversation.unread > 0 ? (
                <Badge variant="secondary" className="text-xs">
                  {conversation.unread}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-white p-4">
              <div className="flex items-center gap-3">
                <Avatar alt={selectedConversation.name} src={selectedConversation.avatar} className="h-10 w-10" />
                <div>
                  <h2 className="text-body font-medium text-[var(--text-primary)]">{selectedConversation.name}</h2>
                  <p className="text-caption text-[var(--text-muted)]">
                    {selectedConversation.isGroup ? "Group conversation" : "Direct conversation"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" type="button">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" type="button">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" type="button">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {feedback ? (
              <div className="border-b border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
                {feedback}
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.isOwn
                          ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                          : "bg-white text-[var(--text-primary)]"
                      }`}
                    >
                      {!message.isOwn ? (
                        <p className="mb-1 text-xs font-semibold text-[var(--text-muted)]">{message.senderName}</p>
                      ) : null}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`mt-2 text-caption ${message.isOwn ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] bg-white p-4">
              <form
                className="flex items-center gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
              >
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input-clean"
                />
                <Button type="submit" size="icon" variant="outline">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-secondary)]">
            Choose a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
