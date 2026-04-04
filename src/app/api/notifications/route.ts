import { connectDB } from "@/lib/db";
import { serializeNotifications } from "@/lib/notification-service";
import { getRequestUserId } from "@/lib/request-auth";
import { NotificationModel } from "@/models/Notification";

export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = await getRequestUserId(req);

    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await NotificationModel.countDocuments({ userId, isRead: false });

    return new Response(
      JSON.stringify({
        ok: true,
        unreadCount,
        notifications: await serializeNotifications(notifications),
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to load notifications right now." }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const userId = await getRequestUserId(req);

    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const notificationId = String(body.notificationId || "").trim();
    const markAll = Boolean(body.markAll);

    if (markAll) {
      await NotificationModel.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    } else if (notificationId) {
      await NotificationModel.findOneAndUpdate({ _id: notificationId, userId }, { $set: { isRead: true } });
    } else {
      return new Response(JSON.stringify({ ok: false, error: "Nothing to update." }), { status: 400 });
    }

    const unreadCount = await NotificationModel.countDocuments({ userId, isRead: false });
    return new Response(JSON.stringify({ ok: true, unreadCount }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to update notifications right now." }), { status: 500 });
  }
}
