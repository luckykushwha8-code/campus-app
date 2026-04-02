import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "date-fns";
import { Heart, MessageCircle, UserPlus, Bell, Calendar, Briefcase, Users } from "lucide-react";

const mockNotifications = [
  {
    id: "1",
    type: "like",
    title: "Rahul Sharma liked your post",
    body: "Hey, great post about the hackathon!",
    avatar: undefined,
    createdAt: formatRelative(new Date(Date.now() - 3600000), new Date()),
    isRead: false,
  },
  {
    id: "2",
    type: "comment",
    title: "Priya Patel commented on your post",
    body: "Where can I get those notes?",
    avatar: undefined,
    createdAt: formatRelative(new Date(Date.now() - 7200000), new Date()),
    isRead: false,
  },
  {
    id: "3",
    type: "friend_request",
    title: "New friend request",
    body: "Amit Kumar wants to connect with you",
    avatar: undefined,
    createdAt: formatRelative(new Date(Date.now() - 86400000), new Date()),
    isRead: false,
  },
  {
    id: "4",
    type: "event",
    title: "New event: Hackathon 2025",
    body: "Tech Club has created a new event",
    avatar: undefined,
    createdAt: formatRelative(new Date(Date.now() - 86400000 * 2), new Date()),
    isRead: true,
  },
  {
    id: "5",
    type: "job",
    title: "New job opportunity",
    body: "Google is hiring SDEs - Apply now!",
    avatar: undefined,
    createdAt: formatRelative(new Date(Date.now() - 86400000 * 3), new Date()),
    isRead: true,
  },
  {
    id: "6",
    type: "room",
    title: "New message in CSE 2025",
    body: "Someone mentioned you in a room",
    avatar: undefined,
    createdAt: formatRelative(new Date(Date.now() - 86400000 * 4), new Date()),
    isRead: true,
  },
];

const typeIcons: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  friend_request: UserPlus,
  event: Calendar,
  job: Briefcase,
  room: Users,
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-screen-lg px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-title font-semibold text-[var(--text-primary)]">Notifications</h1>
            <button className="button-ghost gap-2">
              Mark all read
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {mockNotifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <div
                key={notif.id}
                className={`flex gap-3 p-3 rounded-md border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors ${
                  !notif.isRead ? "bg-[var(--accent)]/10" : ""
                }`}
              >
                <div className="relative">
                  <Avatar alt="" src={notif.avatar} className="h-8 w-8" />
                  <div className="absolute -bottom-1 -right-1 p-1">
                    <Icon className="h-3 w-3 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-body font-medium text-[var(--text-primary)]">{notif.title}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{notif.body}</p>
                      <p className="text-caption text-[var(--text-muted)]">{notif.createdAt}</p>
                    </div>
                    {!notif.isRead && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}