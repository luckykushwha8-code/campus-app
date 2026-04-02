import { Schema, model, Document } from "mongoose";

export interface IStory extends Document {
  userId: string;
  url: string;
  type: "image" | "video";
  expiresAt: Date;
  createdAt: Date;
}

const StorySchema = new Schema<IStory>({
  userId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], default: "image" },
  expiresAt: { type: Date, index: true },
}, { timestamps: true });

export const StoryModel = model<IStory>("Story", StorySchema);
export default StoryModel;
