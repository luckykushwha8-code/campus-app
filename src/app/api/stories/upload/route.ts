import { connectDB } from '@/lib/db';
import { StoryModel } from '@/models/Story';
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, url, type } = body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const story = await StoryModel.create({ userId, url, type: type ?? 'image', expiresAt });
    return new Response(JSON.stringify({ ok: true, story }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
