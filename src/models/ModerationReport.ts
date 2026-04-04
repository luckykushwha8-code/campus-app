import { Schema, model, models, Document } from "mongoose";

export interface IModerationReport extends Document {
  targetType: "post" | "comment";
  targetId: string;
  reporterId: string;
  ownerId: string;
  reason: string;
  status: "open" | "reviewed" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

const ModerationReportSchema = new Schema<IModerationReport>(
  {
    targetType: { type: String, enum: ["post", "comment"], required: true, index: true },
    targetId: { type: String, required: true, index: true },
    reporterId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "reviewed", "dismissed"], default: "open", index: true },
  },
  { timestamps: true }
);

ModerationReportSchema.index({ targetType: 1, targetId: 1, reporterId: 1 }, { unique: true });

export const ModerationReportModel =
  models.ModerationReport || model<IModerationReport>("ModerationReport", ModerationReportSchema);
export default ModerationReportModel;
