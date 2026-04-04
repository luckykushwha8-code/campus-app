import { connectDB } from "@/lib/db";
import { defaultClubs } from "@/lib/community-data";
import { getRequestUserId } from "@/lib/request-auth";
import { ClubModel } from "@/models/Club";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureSeeded() {
  const count = await ClubModel.countDocuments();
  if (!count) {
    await ClubModel.insertMany(defaultClubs);
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    await ensureSeeded();
    const userId = await getRequestUserId(req);
    const clubs = await ClubModel.find().sort({ createdAt: -1 }).lean();
    return Response.json({
      ok: true,
      clubs: clubs.map((club: any) => ({
        id: String(club._id),
        name: club.name,
        description: club.description || "",
        logo: club.logo || "",
        membersCount: club.memberIds?.length || 0,
        isMember: userId ? club.memberIds?.includes(userId) : false,
      })),
    });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = body.name?.trim();
    const description = body.description?.trim() || "";
    const logo = body.logo?.trim() || "";

    if (!name) {
      return Response.json({ ok: false, error: "Club name is required" }, { status: 400 });
    }

    await connectDB();
    const club = await ClubModel.create({
      slug: `${slugify(name)}-${Date.now()}`,
      name,
      description,
      logo,
      creatorId: userId,
      memberIds: [userId],
    });

    return Response.json({
      ok: true,
      club: {
        id: String(club._id),
        name: club.name,
        description: club.description || "",
        logo: club.logo || "",
        membersCount: club.memberIds.length,
        isMember: true,
      },
    }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
