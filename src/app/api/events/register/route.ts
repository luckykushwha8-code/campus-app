import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/server-auth";
import { EventModel } from "@/models/Event";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return Response.json({ ok: false, error: "Missing event" }, { status: 400 });
    }

    await connectDB();
    const event = await EventModel.findById(eventId);
    if (!event) {
      return Response.json({ ok: false, error: "Event not found" }, { status: 404 });
    }

    const joined = event.attendeeIds.includes(session.userId);
    event.attendeeIds = joined
      ? event.attendeeIds.filter((id: string) => id !== session.userId)
      : [...event.attendeeIds, session.userId];
    await event.save();

    return Response.json({
      ok: true,
      event: {
        id: String(event._id),
        title: event.title,
        description: event.description || "",
        image: event.image || "",
        location: event.location,
        startDate: new Date(event.startDate).toISOString(),
        organizer: { name: event.organizerName },
        attendees: event.attendeeIds.length,
        isRegistered: !joined,
      },
    });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
