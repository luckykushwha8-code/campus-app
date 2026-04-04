import { connectDB } from "@/lib/db";
import { serializeEvent } from "@/lib/event-serialization";
import { getRequestUser } from "@/lib/request-auth";
import { EventModel } from "@/models/Event";

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);
    if (!user?._id) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return Response.json({ ok: false, error: "Missing event." }, { status: 400 });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return Response.json({ ok: false, error: "Event not found." }, { status: 404 });
    }

    const currentUserId = String(user._id);
    const joined = event.attendeeIds.includes(currentUserId);
    event.attendeeIds = joined
      ? event.attendeeIds.filter((id: string) => id !== currentUserId)
      : [...new Set([...event.attendeeIds, currentUserId])];
    await event.save();

    return Response.json({
      ok: true,
      event: serializeEvent(event.toObject(), currentUserId),
    });
  } catch {
    return Response.json({ ok: false, error: "Unable to update registration right now." }, { status: 500 });
  }
}
