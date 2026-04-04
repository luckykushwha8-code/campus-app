import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import { serializePrivateUser } from '@/lib/user-serialization';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body.password || "");
    const email = body.email?.trim().toLowerCase();
    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'Enter your email and password.' }), { status: 400 });
    }
    await connectDB();
    const user = await UserModel.findOne({ email });
    if (!user || !user.passwordHash) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email or password.' }), { status: 400 });
    }
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email or password.' }), { status: 400 });
    }
    const token = signToken({ userId: user._id });
    return new Response(JSON.stringify({
      ok: true,
      token,
      user: serializePrivateUser(user),
    }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
