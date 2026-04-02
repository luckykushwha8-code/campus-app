import { connectDB } from '@/lib/db';
import { MessageModel } from '@/models/Chat';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const limit = Number(url.searchParams.get('limit') ?? '50');
    await connectDB();
    const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 }).limit(limit).lean();
    return new Response(JSON.stringify({ ok: true, messages }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
