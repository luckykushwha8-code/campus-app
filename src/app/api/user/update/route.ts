import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { getRequestUser } from '@/lib/request-auth';
import { serializePrivateUser } from '@/lib/user-serialization';
import { buildUsername } from '@/lib/username';

export async function PUT(req: Request) {
  try {
    const requestUser = await getRequestUser(req);
    if (!requestUser?._id) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { userId, updates } = body;
    if (!userId || !updates) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing data' }), { status: 400 });
    }
    if (userId !== String(requestUser._id)) {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403 });
    }

    const name = String(updates.name || "").trim();
    const usernameInput = String(updates.username || "").trim().toLowerCase();
    const bio = String(updates.bio || "").trim();
    const collegeName = String(updates.collegeName || "").trim();
    const collegeId = String(updates.collegeId || "").trim();

    if (name.length < 2) {
      return new Response(JSON.stringify({ ok: false, error: "Name must be at least 2 characters." }), { status: 400 });
    }
    if (name.length > 60) {
      return new Response(JSON.stringify({ ok: false, error: "Name must stay under 60 characters." }), { status: 400 });
    }
    if (bio.length > 240) {
      return new Response(JSON.stringify({ ok: false, error: "Bio must stay under 240 characters." }), { status: 400 });
    }

    const username = usernameInput || buildUsername(name, requestUser.email);
    if (!/^[a-z0-9._]{3,24}$/.test(username)) {
      return new Response(JSON.stringify({ ok: false, error: "Username must be 3 to 24 characters and use only letters, numbers, dots, or underscores." }), { status: 400 });
    }

    await connectDB();
    const usernameOwner = await UserModel.findOne({ username, _id: { $ne: userId } }).select("_id").lean();
    if (usernameOwner) {
      return new Response(JSON.stringify({ ok: false, error: "That username is already taken." }), { status: 400 });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          username,
          bio,
          collegeName,
          collegeId,
        },
      },
      { new: true }
    ).lean();
    if (!user) return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, user: serializePrivateUser(user) }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
