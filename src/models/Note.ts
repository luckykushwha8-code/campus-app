import { Schema, model, models, Document } from "mongoose";

export interface INote extends Document {
  authorId: string;
  authorName: string;
  title: string;
  description?: string;
  subject: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloads: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    authorId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    subject: { type: String, required: true, trim: true, index: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const NoteModel = models.Note || model<INote>("Note", NoteSchema);
export default NoteModel;
