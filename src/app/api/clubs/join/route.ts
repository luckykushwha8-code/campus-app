import { connectDB } from "@/lib/db";
import { getRequestUserId } from "@/lib/request-auth";
import { ClubModel } from "@/models/Club";

export async function POST(req: Request) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { clubId } = await req.json();
    if (!clubId) {
      return Response.json({ ok: false, error: "Missing club" }, { status: 400 });
    }

    await connectDB();
    const club = await ClubModel.findById(clubId);
    if (!club) {
      return Response.json({ ok: false, error: "Club not found" }, { status: 404 });
    }

    const joined = club.memberIds.includes(userId);
    club.memberIds = joined
      ? club.memberIds.filter((id: string) => id !== userId)
      : [...club.memberIds, userId];
    await club.save();

    return Response.json({
      ok: true,
      club: {
        id: String(club._id),
        name: club.name,
        description: club.description || "",
        logo: club.logo || "",
        membersCount: club.memberIds.length,
        isMember: !joined,
      },
    });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
