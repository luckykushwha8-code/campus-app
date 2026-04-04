import { connectDB } from "@/lib/db";
import { Types } from "mongoose";
import { getRequestUser, getRequestUserId } from "@/lib/request-auth";
import { serializeRoom } from "@/lib/room-serialization";
import { RoomModel } from "@/models/Room";

export async function GET(req: Request, context: any) {
  try {
    await connectDB();
    const currentUserId = await getRequestUserId(req);
    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) {
      return Response.json({ ok: false, error: "Room not found." }, { status: 404 });
    }
    const room = await RoomModel.findById(id).lean();

    if (!room) {
      return Response.json({ ok: false, error: "Room not found." }, { status: 404 });
    }

    return Response.json({
      ok: true,
      room: serializeRoom(room, currentUserId),
    });
  } catch {
    return Response.json({ ok: false, error: "Unable to load this room right now." }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    await connectDB();
    const user = await getRequestUser(req);
    if (!user?._id) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) {
      return Response.json({ ok: false, error: "Room not found." }, { status: 404 });
    }
    const room = await RoomModel.findById(id);
    if (!room) {
      return Response.json({ ok: false, error: "Room not found." }, { status: 404 });
    }

    if (String(room.creatorId || "") !== String(user._id) && user.role !== "admin") {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    await RoomModel.findByIdAndDelete(id);
    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ ok: false, error: "Unable to delete this room right now." }, { status: 500 });
  }
}
