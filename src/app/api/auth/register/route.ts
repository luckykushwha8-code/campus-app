import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';
import { serializePrivateUser } from '@/lib/user-serialization';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const collegeId = String(body.collegeId || "").trim();
    const collegeName = String(body.collegeName || "").trim();
    const email = body.email?.trim().toLowerCase();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ ok: false, error: 'Enter your full name.' }), { status: 400 });
    }
    if (!email || !emailValid) {
      return new Response(JSON.stringify({ ok: false, error: 'Enter a valid email address.' }), { status: 400 });
    }
    if (password.length < 8) {
      return new Response(JSON.stringify({ ok: false, error: 'Use a password with at least 8 characters.' }), { status: 400 });
    }
    await connectDB();
    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      return new Response(JSON.stringify({ ok: false, error: 'An account with this email already exists.' }), { status: 400 });
    }
    const hash = await hashPassword(password);
    const user = await UserModel.create({ email, passwordHash: hash, name, collegeId, collegeName, role: 'student', verified: false });
    const token = signToken({ userId: user._id });
    return new Response(JSON.stringify({
      ok: true,
      token,
      user: serializePrivateUser(user),
    }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
