import { CommentModel } from "@/models/Comment";
import { ModerationReportModel } from "@/models/ModerationReport";
import { PostModel } from "@/models/Post";

const REPORT_LIMIT_PER_HOUR = 5;
const AUTO_HIDE_THRESHOLD = 3;

export async function canUserSubmitReport(reporterId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentReports = await ModerationReportModel.countDocuments({
    reporterId,
    createdAt: { $gte: oneHourAgo },
  });

  return recentReports < REPORT_LIMIT_PER_HOUR;
}

export async function createModerationReport({
  targetType,
  targetId,
  reporterId,
  ownerId,
  reason,
}: {
  targetType: "post" | "comment";
  targetId: string;
  reporterId: string;
  ownerId: string;
  reason: string;
}) {
  const report = await ModerationReportModel.create({
    targetType,
    targetId,
    reporterId,
    ownerId,
    reason,
    status: "open",
  });

  const reportCount = await ModerationReportModel.countDocuments({
    targetType,
    targetId,
    status: "open",
  });

  const moderationStatus = reportCount >= AUTO_HIDE_THRESHOLD ? "reported" : "active";

  if (targetType === "post") {
    await PostModel.findByIdAndUpdate(targetId, {
      $set: { moderationStatus },
      $max: { reportCount },
    });
  } else {
    await CommentModel.findByIdAndUpdate(targetId, {
      $set: { moderationStatus },
      $max: { reportCount },
    });
  }

  return { report, reportCount, moderationStatus };
}
