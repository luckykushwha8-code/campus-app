import { Schema, model, models, Document } from "mongoose";

export interface IPost extends Document {
  authorId: string;
  content: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: string[];
  commentsCount: number;
  likesCount: number;
  isAnonymous?: boolean;
  audience?: "campus" | "class" | "public";
  campusId?: string;
  campusName?: string;
}

const PostSchema = new Schema<IPost>({
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  images: { type: [String], default: [] },
  likes: { type: [String], default: [] },
  commentsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  isAnonymous: { type: Boolean, default: false },
  audience: { type: String, enum: ["campus", "class", "public"], default: "campus" },
  campusId: { type: String },
  campusName: { type: String },
}, { timestamps: true });

export const PostModel = models.Post || model<IPost>("Post", PostSchema);
export default PostModel;
