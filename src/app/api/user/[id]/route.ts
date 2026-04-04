import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { serializePublicUser } from '@/lib/user-serialization';

export async function GET(req: Request, { params }: any) {
  try {
    await connectDB();
    const id = params?.id;
    if (!id) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400 });
    const user = await UserModel.findById(id).lean();
    if (!user) return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, user: serializePublicUser(user) }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
