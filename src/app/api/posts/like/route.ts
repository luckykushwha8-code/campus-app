import { connectDB } from '@/lib/db';
import { PostModel } from '@/models/Post';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    const user = verifyToken(token) as any;
    if (!user?.userId) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    const { postId } = await req.json();
    await connectDB();
    const post = await PostModel.findById(postId);
    if (!post) return new Response(JSON.stringify({ ok: false, error: 'Post not found' }), { status: 404 });
    const hasLiked = post.likes.includes(user.userId);
    if (hasLiked) {
      post.likes = post.likes.filter((id: string) => id !== user.userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likes.push(user.userId);
      post.likesCount = post.likesCount + 1;
    }
    await post.save();
    return new Response(JSON.stringify({ ok: true, liked: !hasLiked, likesCount: post.likesCount }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
