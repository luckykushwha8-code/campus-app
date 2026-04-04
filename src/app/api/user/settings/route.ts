import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/server-auth";
import { UserModel } from "@/models/User";
import { serializePrivateUser } from "@/lib/user-serialization";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    await connectDB();
    const user = await UserModel.findById(session.userId).lean();
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ ok: true, settings: serializePrivateUser(user).settings }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Server error" }), { status: 500 });
  }
}
