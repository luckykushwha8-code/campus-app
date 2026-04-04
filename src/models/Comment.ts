import { Schema, model, models, Document } from "mongoose";

export interface IComment extends Document {
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  moderationStatus?: "active" | "reported" | "removed";
  reportCount?: number;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: String, required: true, index: true },
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  moderationStatus: { type: String, enum: ["active", "reported", "removed"], default: "active", index: true },
  reportCount: { type: Number, default: 0 },
}, { timestamps: true });

export const CommentModel = models.Comment || model<IComment>("Comment", CommentSchema);
export default CommentModel;
