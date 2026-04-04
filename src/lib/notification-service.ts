import { NotificationModel } from "@/models/Notification";
import { UserModel } from "@/models/User";

type NotificationPayload = {
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  postId?: string;
  commentId?: string;
  message?: string;
};

function normalizeActorName(name?: string, email?: string) {
  if (name?.trim()) {
    return name.trim();
  }

  if (email) {
    return email.split("@")[0];
  }

  return "Someone";
}

export async function createNotification({
  userId,
  type,
  payload,
}: {
  userId: string;
  type: "like" | "comment" | "follow" | "message" | "system";
  payload?: NotificationPayload;
}) {
  if (!userId) {
    return null;
  }

  return NotificationModel.create({
    userId,
    type,
    payload: payload || {},
    isRead: false,
  });
}

export async function serializeNotifications(notifications: any[]) {
  const actorIds = Array.from(
    new Set(
      notifications
        .map((item) => item.payload?.actorId)
        .filter((value): value is string => Boolean(value))
    )
  );

  const actors = actorIds.length
    ? await UserModel.find({ _id: { $in: actorIds } }).lean()
    : [];
  const actorMap = new Map(actors.map((actor) => [String(actor._id), actor]));

  return notifications.map((item) => {
    const actor = item.payload?.actorId ? actorMap.get(String(item.payload.actorId)) : null;
    const actorName = normalizeActorName(
      actor?.name || item.payload?.actorName,
      actor?.email
    );

    return {
      id: String(item._id),
      type: item.type,
      isRead: Boolean(item.isRead),
      createdAt: item.createdAt,
      actor: actor
        ? {
            id: String(actor._id),
            name: actorName,
            avatarUrl: actor.avatarUrl || item.payload?.actorAvatarUrl || "",
          }
        : {
            id: item.payload?.actorId || "",
            name: actorName,
            avatarUrl: item.payload?.actorAvatarUrl || "",
          },
      payload: item.payload || {},
      title:
        item.type === "like"
          ? `${actorName} liked your post`
          : item.type === "comment"
            ? `${actorName} commented on your post`
            : item.type === "message"
              ? `${actorName} sent you a message`
              : item.payload?.message || "New notification",
      body:
        item.payload?.message ||
        (item.type === "like"
          ? "Your post got a new like."
          : item.type === "comment"
            ? "Open the post to read the new comment."
            : "There is a new update for your account."),
    };
  });
}
