import { Schema, model, models, Document } from "mongoose";

export interface IComment extends Document {
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: String, required: true, index: true },
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const CommentModel = models.Comment || model<IComment>("Comment", CommentSchema);
export default CommentModel;
