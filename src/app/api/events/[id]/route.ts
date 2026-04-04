import { connectDB } from "@/lib/db";
import { serializeEvent } from "@/lib/event-serialization";
import { getRequestUser, getRequestUserId } from "@/lib/request-auth";
import { EventModel } from "@/models/Event";

export async function GET(req: Request, context: any) {
  try {
    await connectDB();
    const currentUserId = await getRequestUserId(req);
    const { id } = await context.params;
    const event = await EventModel.findById(id).lean();

    if (!event) {
      return Response.json({ ok: false, error: "Event not found." }, { status: 404 });
    }

    return Response.json({
      ok: true,
      event: serializeEvent(event, currentUserId),
    });
  } catch {
    return Response.json({ ok: false, error: "Unable to load this event right now." }, { status: 500 });
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
    const event = await EventModel.findById(id);
    if (!event) {
      return Response.json({ ok: false, error: "Event not found." }, { status: 404 });
    }

    if (String(event.creatorId || "") !== String(user._id) && user.role !== "admin") {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    await EventModel.findByIdAndDelete(id);
    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ ok: false, error: "Unable to delete this event right now." }, { status: 500 });
  }
}
