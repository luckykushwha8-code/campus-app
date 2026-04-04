import { connectDB } from "@/lib/db";
import { defaultEvents } from "@/lib/community-data";
import { getServerSession } from "@/lib/server-auth";
import { EventModel } from "@/models/Event";
import { UserModel } from "@/models/User";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureSeeded() {
  const count = await EventModel.countDocuments();
  if (!count) {
    await EventModel.insertMany(defaultEvents);
  }
}

export async function GET() {
  try {
    await connectDB();
    await ensureSeeded();
    const session = await getServerSession();
    const events = await EventModel.find().sort({ startDate: 1 }).lean();
    return Response.json({
      ok: true,
      events: events.map((event: any) => ({
        id: String(event._id),
        title: event.title,
        description: event.description || "",
        image: event.image || "",
        location: event.location,
        startDate: new Date(event.startDate).toISOString(),
        organizer: { name: event.organizerName },
        attendees: event.attendeeIds?.length || 0,
        isRegistered: session ? event.attendeeIds?.includes(session.userId) : false,
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
    const title = body.title?.trim();
    const description = body.description?.trim() || "";
    const location = body.location?.trim();
    const startDate = body.startDate;

    if (!title || !location || !startDate) {
      return Response.json({ ok: false, error: "Missing event details" }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(session.userId).lean();
    const event = await EventModel.create({
      slug: `${slugify(title)}-${Date.now()}`,
      title,
      description,
      image: `https://picsum.photos/seed/event-${Date.now()}/600/400`,
      location,
      startDate: new Date(startDate),
      organizerName: user?.name || "Campus User",
      creatorId: session.userId,
      attendeeIds: [session.userId],
    });

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
        isRegistered: true,
      },
    }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
