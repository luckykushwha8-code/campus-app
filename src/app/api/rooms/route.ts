import { connectDB } from "@/lib/db";
import { defaultRooms } from "@/lib/community-data";
import { getRequestUser } from "@/lib/request-auth";
import { serializeRoom } from "@/lib/room-serialization";
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

export async function GET(req: Request) {
  try {
    await connectDB();
    await ensureSeeded();
    const user = await getRequestUser(req);
    const currentUserId = user?._id ? String(user._id) : null;
    const rooms = await RoomModel.find().sort({ createdAt: -1 }).lean();

    return Response.json({
      ok: true,
      rooms: rooms.map((room: any) => serializeRoom(room, currentUserId)),
    });
  } catch {
    return Response.json({ ok: false, error: "Unable to load rooms right now." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);
    if (!user?._id) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const type = String(body.type || "study").trim();

    if (name.length < 3) {
      return Response.json({ ok: false, error: "Room name must be at least 3 characters." }, { status: 400 });
    }

    if (description.length > 500) {
      return Response.json({ ok: false, error: "Description must stay under 500 characters." }, { status: 400 });
    }

    const allowedTypes = new Set(["study", "class", "club", "placement", "buysell", "college", "hostel"]);
    if (!allowedTypes.has(type)) {
      return Response.json({ ok: false, error: "Choose a valid room type." }, { status: 400 });
    }

    const existing = await RoomModel.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }).lean();
    if (existing) {
      return Response.json({ ok: false, error: "A room with this name already exists." }, { status: 409 });
    }

    const room = await RoomModel.create({
      slug: `${slugify(name)}-${Date.now()}`,
      name,
      description,
      type,
      creatorId: String(user._id),
      creatorName: user.name || user.email.split("@")[0],
      memberIds: [String(user._id)],
    });

    return Response.json(
      {
        ok: true,
        room: serializeRoom(room.toObject(), String(user._id)),
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ ok: false, error: "Unable to create room right now." }, { status: 500 });
  }
}
