"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSession } from "@/hooks/use-app-session";
import { Plus, Search, Send } from "lucide-react";

type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  profileId?: string;
  lastMessage: string;
  time: string;
  unread: number;
  isGroup: boolean;
  subtitle?: string;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  profileId?: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
};

export default function MessagesPage() {
  const { isAuthenticated, token } = useAppSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const loadConversations = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    try {
      const response = await fetch("/api/chat/messages", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    } finally {
      setIsLoadingConversations(false);
    }
  }, [token, isAuthenticated, selectedConversationId]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!token) {
        return;
      }

      setIsLoadingMessages(true);
      try {
        const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          setFeedback(data.error || "Unable to load messages.");
          return;
        }
        setMessages(data.messages || []);
      } catch {
        setFeedback("Unable to load messages.");
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [token]
  );

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
    if (!input.trim() || !selectedConversationId || !token || isSending) return;
    setFeedback("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    } finally {
      setIsSending(false);
    }
  }

  async function handleCreateConversation() {
    if (!recipientEmail.trim() || !token || isCreatingChat) {
      return;
    }

    setIsCreatingChat(true);
    setFeedback("");
    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: recipientEmail.trim().toLowerCase() }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.conversation) {
        setFeedback(data.error || "Unable to start a conversation.");
        return;
      }

      setConversations((current) => {
        const withoutDuplicate = current.filter((conversation) => conversation.id !== data.conversation.id);
        return [data.conversation, ...withoutDuplicate];
      });
      setSelectedConversationId(data.conversation.id);
      setRecipientEmail("");
      setShowCreateChat(false);
      setFeedback("Conversation ready.");
    } catch {
      setFeedback("Unable to start a conversation.");
    } finally {
      setIsCreatingChat(false);
    }
  }

  const filteredConversations = conversations.filter((conversation) =>
    `${conversation.name} ${conversation.lastMessage} ${conversation.subtitle || ""}`.toLowerCase().includes(search.trim().toLowerCase())
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
            <Button
              size="sm"
              variant="outline"
              type="button"
              aria-label="Start a new chat"
              title="Start a new chat"
              onClick={() => setShowCreateChat((value) => !value)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showCreateChat ? (
            <div className="mb-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Start direct chat
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="student@college.edu"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  className="input-clean"
                />
                <Button type="button" onClick={handleCreateConversation} disabled={isCreatingChat}>
                  {isCreatingChat ? "..." : "Start"}
                </Button>
              </div>
            </div>
          ) : null}

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
          {isLoadingConversations ? (
            <div className="px-4 py-8 text-sm text-[var(--text-secondary)]">Loading conversations...</div>
          ) : filteredConversations.length ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[var(--bg-secondary)] ${
                  selectedConversationId === conversation.id ? "bg-[var(--bg-secondary)]" : ""
                }`}
                onClick={() => setSelectedConversationId(conversation.id)}
                type="button"
              >
                {conversation.profileId ? (
                  <Link href={`/profile/${conversation.profileId}`} onClick={(event) => event.stopPropagation()}>
                    <Avatar alt={conversation.name} src={conversation.avatar} className="h-10 w-10" />
                  </Link>
                ) : (
                  <Avatar alt={conversation.name} src={conversation.avatar} className="h-10 w-10" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-body font-medium text-[var(--text-primary)]">{conversation.name}</span>
                    <span className="text-caption text-[var(--text-muted)]">
                      {formatDistanceToNow(new Date(conversation.time), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="truncate text-xs text-[var(--text-muted)]">{conversation.subtitle}</p>
                  <p className="truncate text-sm text-[var(--text-secondary)]">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    {conversation.unread}
                  </Badge>
                ) : null}
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-[var(--text-secondary)]">
              No conversations match your search yet. Start a direct chat or open one of your campus groups.
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-white p-4">
              <div className="flex items-center gap-3">
                {selectedConversation.profileId ? (
                  <Link href={`/profile/${selectedConversation.profileId}`}>
                    <Avatar alt={selectedConversation.name} src={selectedConversation.avatar} className="h-10 w-10" />
                  </Link>
                ) : (
                  <Avatar alt={selectedConversation.name} src={selectedConversation.avatar} className="h-10 w-10" />
                )}
                <div>
                  <h2 className="text-body font-medium text-[var(--text-primary)]">
                    {selectedConversation.profileId ? (
                      <Link className="hover:text-[var(--accent)]" href={`/profile/${selectedConversation.profileId}`}>
                        {selectedConversation.name}
                      </Link>
                    ) : (
                      selectedConversation.name
                    )}
                  </h2>
                  <p className="text-caption text-[var(--text-muted)]">
                    {selectedConversation.subtitle || (selectedConversation.isGroup ? "Group conversation" : "Direct conversation")}
                  </p>
                </div>
              </div>
            </div>

            {feedback ? (
              <div className="border-b border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
                {feedback}
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingMessages ? (
                <div className="text-sm text-[var(--text-secondary)]">Loading messages...</div>
              ) : (
                <div className="space-y-4">
                  {messages.length ? (
                    messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            message.isOwn
                              ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                              : "bg-white text-[var(--text-primary)]"
                          }`}
                        >
                          {!message.isOwn ? (
                            <p className="mb-1 text-xs font-semibold text-[var(--text-muted)]">
                              {message.profileId ? (
                                <Link className="hover:text-[var(--accent)]" href={`/profile/${message.profileId}`}>
                                  {message.senderName}
                                </Link>
                              ) : (
                                message.senderName
                              )}
                            </p>
                          ) : null}
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          <p className={`mt-2 text-caption ${message.isOwn ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-white px-4 py-8 text-sm text-[var(--text-secondary)]">
                      No messages yet. Send the first one to start this conversation.
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
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
                  maxLength={1000}
                />
                <Button type="submit" size="icon" variant="outline" disabled={!input.trim() || isSending}>
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
