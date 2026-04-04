"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "date-fns";
import { Heart, MessageCircle, Bell } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
};

const typeIcons: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
};

export default function NotificationsPage() {
  const { token, isAuthenticated } = useAppSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to load notifications.");
        setNotifications([]);
        return;
      }

      setNotifications(data.notifications || []);
    } catch {
      setStatus("Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function markAllRead() {
    if (!token) {
      return;
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAll: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to update notifications.");
        return;
      }

      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch {
      setStatus("Unable to update notifications.");
    }
  }

  async function markOneRead(notificationId: string) {
    if (!token) {
      return;
    }

    setNotifications((current) => current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));

    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-screen-lg px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold text-[var(--text-primary)]">Notifications</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Likes, comments, and account activity appear here.</p>
          </div>
          <button className="button-ghost gap-2" onClick={markAllRead} type="button">
            Mark all read
          </button>
        </div>

        {status ? (
          <div className="mb-4 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
            {status}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-3xl border border-[var(--border-color)] bg-white p-6 text-sm text-[var(--text-secondary)]">Loading notifications...</div>
        ) : notifications.length ? (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const Icon = typeIcons[notif.type] || Bell;
              return (
                <button
                  key={notif.id}
                  className={`flex w-full gap-3 rounded-3xl border border-[var(--border-color)] p-4 text-left transition-colors hover:bg-[var(--bg-secondary)] ${!notif.isRead ? "bg-[var(--accent)]/10" : "bg-white"}`}
                  onClick={() => markOneRead(notif.id)}
                  type="button"
                >
                  <div className="relative">
                    <Avatar alt={notif.actor?.name || "Notification"} src={notif.actor?.avatarUrl} className="h-10 w-10" />
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1">
                      <Icon className="h-3 w-3 text-[var(--text-muted)]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-body font-medium text-[var(--text-primary)]">{notif.title}</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{notif.body}</p>
                        <p className="mt-2 text-caption text-[var(--text-muted)]">
                          {formatRelative(new Date(notif.createdAt), new Date())}
                        </p>
                      </div>
                      {!notif.isRead ? (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--border-color)] bg-white px-4 py-10 text-center">
            <p className="text-base font-semibold text-[var(--text-primary)]">No notifications yet</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">When someone likes or comments on your posts, you will see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
