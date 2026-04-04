import { connectDB } from "@/lib/db";
import { defaultRooms } from "@/lib/community-data";
import { getServerSession } from "@/lib/server-auth";
import { RoomModel } from "@/models/Room";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureSeeded() {
  const count = await RoomModel.countDocuments();
  if (!count) {
    await RoomModel.insertMany(defaultRooms);
  }
}

export async function GET() {
  try {
    await connectDB();
    await ensureSeeded();
    const session = await getServerSession();
    const rooms = await RoomModel.find().sort({ createdAt: -1 }).lean();
    return Response.json({
      ok: true,
      rooms: rooms.map((room: any) => ({
        id: String(room._id),
        name: room.name,
        description: room.description || "",
        type: room.type,
        membersCount: room.memberIds?.length || 0,
        isJoined: session ? room.memberIds?.includes(session.userId) : false,
      })),
    });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = body.name?.trim();
    const description = body.description?.trim() || "";
    const type = body.type?.trim() || "study";

    if (!name) {
      return Response.json({ ok: false, error: "Room name is required" }, { status: 400 });
    }

    await connectDB();
    const room = await RoomModel.create({
      slug: `${slugify(name)}-${Date.now()}`,
      name,
      description,
      type,
      creatorId: session.userId,
      memberIds: [session.userId],
    });

    return Response.json({
      ok: true,
      room: {
        id: String(room._id),
        name: room.name,
        description: room.description || "",
        type: room.type,
        membersCount: room.memberIds.length,
        isJoined: true,
      },
    }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
