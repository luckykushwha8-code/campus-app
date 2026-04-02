import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, collegeId, collegeName } = body;
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
    return new Response(JSON.stringify({ ok: true, token, user: { id: user._id, email: user.email } }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
