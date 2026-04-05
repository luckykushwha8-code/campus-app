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

function getTargetModel(targetType: "post" | "comment") {
  return targetType === "post" ? PostModel : CommentModel;
}

export async function syncTargetModerationState(targetType: "post" | "comment", targetId: string) {
  const openReportCount = await ModerationReportModel.countDocuments({
    targetType,
    targetId,
    status: "open",
  });

  const moderationStatus = openReportCount >= AUTO_HIDE_THRESHOLD ? "reported" : "active";
  await getTargetModel(targetType).findByIdAndUpdate(targetId, {
    $set: {
      reportCount: openReportCount,
      moderationStatus,
    },
  });

  return { openReportCount, moderationStatus };
}

export async function reviewModerationTarget({
  reportId,
  action,
}: {
  reportId: string;
  action: "dismiss" | "remove" | "restore";
}) {
  const report = await ModerationReportModel.findById(reportId);
  if (!report) {
    return { ok: false as const, error: "Report not found." };
  }

  const targetModel = getTargetModel(report.targetType);

  if (action === "dismiss") {
    await ModerationReportModel.findByIdAndUpdate(reportId, { $set: { status: "dismissed" } });
    const result = await syncTargetModerationState(report.targetType, report.targetId);
    return { ok: true as const, reportId, targetId: report.targetId, targetType: report.targetType, ...result };
  }

  if (action === "remove") {
    await targetModel.findByIdAndUpdate(report.targetId, {
      $set: {
        moderationStatus: "removed",
      },
    });
    await ModerationReportModel.updateMany(
      { targetType: report.targetType, targetId: report.targetId, status: "open" },
      { $set: { status: "reviewed" } }
    );
    return {
      ok: true as const,
      reportId,
      targetId: report.targetId,
      targetType: report.targetType,
      openReportCount: 0,
      moderationStatus: "removed" as const,
    };
  }

  await targetModel.findByIdAndUpdate(report.targetId, {
    $set: {
      moderationStatus: "active",
    },
  });
  await ModerationReportModel.updateMany(
    { targetType: report.targetType, targetId: report.targetId, status: "open" },
    { $set: { status: "reviewed" } }
  );
  await targetModel.findByIdAndUpdate(report.targetId, {
    $set: {
      reportCount: 0,
    },
  });

  return {
    ok: true as const,
    reportId,
    targetId: report.targetId,
    targetType: report.targetType,
    openReportCount: 0,
    moderationStatus: "active" as const,
  };
}
