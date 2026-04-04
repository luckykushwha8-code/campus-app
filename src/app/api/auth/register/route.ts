import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';

function buildUsername(email: string, name?: string) {
  const source = name?.trim() || email.split('@')[0] || 'student';
  return source.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'student';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, name, collegeId, collegeName } = body;
    const email = body.email?.trim().toLowerCase();
    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing email or password' }), { status: 400 });
    }
    await connectDB();
    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      return new Response(JSON.stringify({ ok: false, error: 'User exists' }), { status: 400 });
    }
    const hash = await hashPassword(password);
    const user = await UserModel.create({ email, passwordHash: hash, name, collegeId, collegeName, role: 'student', verified: false });
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
    }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
