import { connectDB } from "@/lib/db";
import { getRequestUser } from "@/lib/request-auth";
import { ModerationReportModel } from "@/models/ModerationReport";

export async function GET(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id || user.role !== "admin") {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    }

    const reports = await ModerationReportModel.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return new Response(JSON.stringify({ ok: true, reports }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to load reports right now." }), { status: 500 });
  }
}
