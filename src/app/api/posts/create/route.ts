import { connectDB } from '@/lib/db';
import { PostModel } from '@/models/Post';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    const user = verifyToken(token) as any;
    if (!user?.userId) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });

    const body = await req.json();
    const { content, images, isAnonymous, audience } = body;
    await connectDB();
    const post = await PostModel.create({
      authorId: user.userId,
      content,
      images: images ?? [],
      isAnonymous: !!isAnonymous,
      audience: audience ?? 'campus',
    });
    return new Response(JSON.stringify({ ok: true, post }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
