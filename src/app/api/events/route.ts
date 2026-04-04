import { connectDB } from "@/lib/db";
import { defaultEvents } from "@/lib/community-data";
import { getRequestUser } from "@/lib/request-auth";
import { serializeEvent } from "@/lib/event-serialization";
import { EventModel } from "@/models/Event";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureSeeded() {
  const count = await EventModel.countDocuments();
  if (!count) {
    await EventModel.insertMany(defaultEvents);
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    await ensureSeeded();
    const user = await getRequestUser(req);
    const currentUserId = user?._id ? String(user._id) : null;
    const events = await EventModel.find().sort({ startDate: 1 }).lean();
    return Response.json({
      ok: true,
      events: events.map((event: any) => serializeEvent(event, currentUserId)),
    });
  } catch {
    return Response.json({ ok: false, error: "Unable to load events right now." }, { status: 500 });
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
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const location = String(body.location || "").trim();
    const startDate = String(body.startDate || "").trim();
    const image = String(body.image || "").trim();

    if (title.length < 3) {
      return Response.json({ ok: false, error: "Event title must be at least 3 characters." }, { status: 400 });
    }

    if (!location) {
      return Response.json({ ok: false, error: "Location is required." }, { status: 400 });
    }

    if (!startDate) {
      return Response.json({ ok: false, error: "Choose an event date and time." }, { status: 400 });
    }

    const parsedDate = new Date(startDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return Response.json({ ok: false, error: "Choose a valid event date and time." }, { status: 400 });
    }

    if (parsedDate.getTime() < Date.now() - 60 * 1000) {
      return Response.json({ ok: false, error: "Event date must be in the future." }, { status: 400 });
    }

    if (description.length > 800) {
      return Response.json({ ok: false, error: "Description must stay under 800 characters." }, { status: 400 });
    }

    const event = await EventModel.create({
      slug: `${slugify(title)}-${Date.now()}`,
      title,
      description,
      image,
      location,
      startDate: parsedDate,
      organizerName: user.name || user.email.split("@")[0],
      creatorAvatarUrl: user.avatarUrl || "",
      creatorId: String(user._id),
      attendeeIds: [String(user._id)],
    });

    return Response.json(
      {
        ok: true,
        event: serializeEvent(event.toObject(), String(user._id)),
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ ok: false, error: "Unable to create event right now." }, { status: 500 });
  }
}
