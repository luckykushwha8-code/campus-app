import { connectDB } from '@/lib/db';
import { PostModel } from '@/models/Post';

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);
    const cursor = url.searchParams.get('cursor');
    const query: any = {};
    // basic pagination by _id cursor or createdAt
    if (cursor) query._id = { $lt: cursor };
    const posts = await PostModel.find(query).sort({ _id: -1 }).limit(limit).lean();
    return new Response(JSON.stringify({ ok: true, posts }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
