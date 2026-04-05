import { Schema, model, models, Document } from "mongoose";

export interface IStory extends Document {
  userId: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>({
  userId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], default: "image" },
  caption: { type: String, default: "" },
  expiresAt: { type: Date, index: true },
}, { timestamps: true });

export const StoryModel = models.Story || model<IStory>("Story", StorySchema);
export default StoryModel;
