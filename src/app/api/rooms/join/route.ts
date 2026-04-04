import { connectDB } from "@/lib/db";
import { getRequestUser } from "@/lib/request-auth";
import { serializeRoom } from "@/lib/room-serialization";
import { RoomModel } from "@/models/Room";

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);
    if (!user?._id) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await req.json();
    if (!roomId) {
      return Response.json({ ok: false, error: "Missing room." }, { status: 400 });
    }

    const room = await RoomModel.findById(roomId);
    if (!room) {
      return Response.json({ ok: false, error: "Room not found." }, { status: 404 });
    }

    const currentUserId = String(user._id);
    const joined = room.memberIds.includes(currentUserId);
    room.memberIds = joined
      ? room.memberIds.filter((id: string) => id !== currentUserId)
      : [...new Set([...room.memberIds, currentUserId])];
    await room.save();

    return Response.json({
      ok: true,
      room: serializeRoom(room.toObject(), currentUserId),
    });
  } catch {
    return Response.json({ ok: false, error: "Unable to update room membership right now." }, { status: 500 });
  }
}
