import { connectDB } from "@/lib/db";
import { reviewModerationTarget } from "@/lib/moderation";
import { getRequestUser } from "@/lib/request-auth";
import { CommentModel } from "@/models/Comment";
import { ModerationReportModel } from "@/models/ModerationReport";
import { PostModel } from "@/models/Post";
import { UserModel } from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id || user.role !== "admin") {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    }

    const reports = await ModerationReportModel.find({}).sort({ createdAt: -1 }).limit(100).lean();
    const targetIds = reports.map((report: any) => report.targetId);
    const reporterIds = reports.map((report: any) => report.reporterId);
    const ownerIds = reports.map((report: any) => report.ownerId);

    const [posts, comments, users] = await Promise.all([
      PostModel.find({ _id: { $in: targetIds } }).lean(),
      CommentModel.find({ _id: { $in: targetIds } }).lean(),
      UserModel.find({ _id: { $in: [...reporterIds, ...ownerIds] } }).lean(),
    ]);

    const postMap = new Map(posts.map((item: any) => [String(item._id), item]));
    const commentMap = new Map(comments.map((item: any) => [String(item._id), item]));
    const userMap = new Map(users.map((item: any) => [String(item._id), item]));

    return new Response(
      JSON.stringify({
        ok: true,
        reports: reports.map((report: any) => {
          const target = report.targetType === "post" ? postMap.get(report.targetId) : commentMap.get(report.targetId);
          const reporter = userMap.get(report.reporterId);
          const owner = userMap.get(report.ownerId);

          return {
            id: String(report._id),
            targetType: report.targetType,
            targetId: report.targetId,
            status: report.status,
            reason: report.reason,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            reporter: reporter
              ? {
                  id: String(reporter._id),
                  name: reporter.name || reporter.email?.split("@")[0] || "Reporter",
                  email: reporter.email || "",
                }
              : null,
            owner: owner
              ? {
                  id: String(owner._id),
                  name: owner.name || owner.email?.split("@")[0] || "Owner",
                  email: owner.email || "",
                }
              : null,
            target: target
              ? {
                  id: String(target._id),
                  content: target.content || "",
                  moderationStatus: target.moderationStatus || "active",
                  reportCount: target.reportCount || 0,
                  createdAt: target.createdAt,
                }
              : null,
          };
        }),
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to load reports right now." }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id || user.role !== "admin") {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json();
    const reportId = String(body.reportId || "");
    const action = String(body.action || "");

    if (!reportId || !["dismiss", "remove", "restore"].includes(action)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid moderation action." }), { status: 400 });
    }

    const result = await reviewModerationTarget({
      reportId,
      action: action as "dismiss" | "remove" | "restore",
    });

    if (!result.ok) {
      return new Response(JSON.stringify(result), { status: 404 });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to update report right now." }), { status: 500 });
  }
}
