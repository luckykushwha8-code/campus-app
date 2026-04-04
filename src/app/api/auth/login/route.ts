import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

function buildUsername(email: string, name?: string) {
  const source = name?.trim() || email.split('@')[0] || 'student';
  return source.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'student';
}

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
    return new Response(JSON.stringify({
      ok: true,
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name || user.email.split('@')[0],
        username: buildUsername(user.email, user.name),
        bio: user.bio || '',
        collegeName: user.collegeName || '',
        collegeId: user.collegeId || '',
        avatarUrl: user.avatarUrl || '',
        verified: Boolean(user.verified),
      },
    }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
