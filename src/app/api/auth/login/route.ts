import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing credentials' }), { status: 400 });
    }
    await connectDB();
    const user = await UserModel.findOne({ email });
    if (!user || !user.passwordHash) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid credentials' }), { status: 400 });
    }
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid credentials' }), { status: 400 });
    }
    const token = signToken({ userId: user._id });
    return new Response(JSON.stringify({ ok: true, token, user: { id: user._id, email: user.email } }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
