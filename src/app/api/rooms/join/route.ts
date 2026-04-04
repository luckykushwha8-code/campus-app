import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/server-auth";
import { RoomModel } from "@/models/Room";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await req.json();
    if (!roomId) {
      return Response.json({ ok: false, error: "Missing room" }, { status: 400 });
    }

    await connectDB();
    const room = await RoomModel.findById(roomId);
    if (!room) {
      return Response.json({ ok: false, error: "Room not found" }, { status: 404 });
    }

    const joined = room.memberIds.includes(session.userId);
    room.memberIds = joined
      ? room.memberIds.filter((id: string) => id !== session.userId)
      : [...room.memberIds, session.userId];
    await room.save();

    return Response.json({
      ok: true,
      room: {
        id: String(room._id),
        name: room.name,
        description: room.description || "",
        type: room.type,
        membersCount: room.memberIds.length,
        isJoined: !joined,
      },
    });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
