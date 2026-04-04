import { connectDB } from "@/lib/db";
import { canUserSubmitReport, createModerationReport } from "@/lib/moderation";
import { getRequestUser } from "@/lib/request-auth";
import { CommentModel } from "@/models/Comment";
import { PostModel } from "@/models/Post";

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const targetType = body.targetType === "comment" ? "comment" : "post";
    const targetId = String(body.targetId || "").trim();
    const reason = String(body.reason || "").trim();

    if (!targetId || !reason) {
      return new Response(JSON.stringify({ ok: false, error: "Choose a reason before reporting." }), { status: 400 });
    }

    const canReport = await canUserSubmitReport(String(user._id));
    if (!canReport) {
      return new Response(JSON.stringify({ ok: false, error: "Too many reports in a short time. Please slow down." }), { status: 429 });
    }

    const target =
      targetType === "post"
        ? await PostModel.findById(targetId).lean()
        : await CommentModel.findById(targetId).lean();

    if (!target) {
      return new Response(JSON.stringify({ ok: false, error: "Content not found." }), { status: 404 });
    }

    if (String(target.authorId) === String(user._id)) {
      return new Response(JSON.stringify({ ok: false, error: "You cannot report your own content." }), { status: 400 });
    }

    try {
      const result = await createModerationReport({
        targetType,
        targetId,
        reporterId: String(user._id),
        ownerId: String(target.authorId),
        reason: reason.slice(0, 300),
      });

      return new Response(
        JSON.stringify({
          ok: true,
          reportId: String(result.report._id),
          moderationStatus: result.moderationStatus,
          reportCount: result.reportCount,
        }),
        { status: 201 }
      );
    } catch (error: any) {
      if (error?.code === 11000) {
        return new Response(JSON.stringify({ ok: false, error: "You already reported this content." }), { status: 409 });
      }

      throw error;
    }
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to submit the report right now." }), { status: 500 });
  }
}
