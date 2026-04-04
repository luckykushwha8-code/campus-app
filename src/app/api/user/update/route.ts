import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { getServerSession } from '@/lib/server-auth';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { userId, updates } = body;
    if (!userId || !updates) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing data' }), { status: 400 });
    }
    if (userId !== session.userId) {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403 });
    }
    await connectDB();
    const user = await UserModel.findByIdAndUpdate(userId, updates, { new: true }).lean();
    if (!user) return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 });
    delete (user as any).passwordHash;
    return new Response(JSON.stringify({ ok: true, user }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
