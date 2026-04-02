import { connectDB } from '@/lib/db';
import { StoryModel } from '@/models/Story';
export async function GET(req: Request) {
  try {
    await connectDB();
    const stories = await StoryModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return new Response(JSON.stringify({ ok: true, stories }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
