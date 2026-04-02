import { connectDB } from '@/lib/db';
import { NotificationModel } from '@/models/Notification';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user') || '';
    await connectDB();
    const notifs = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    return new Response(JSON.stringify({ ok: true, notifications: notifs }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, payload } = body;
    await connectDB();
    const notif = await NotificationModel.create({ userId, type, payload, isRead: false });
    return new Response(JSON.stringify({ ok: true, notification: notif }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
