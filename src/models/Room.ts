import { Schema, model, models, Document } from "mongoose";

export interface IRoom extends Document {
  slug: string;
  name: string;
  description?: string;
  type: string;
  memberIds: string[];
  creatorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true, index: true },
    memberIds: { type: [String], default: [] },
    creatorId: { type: String },
  },
  { timestamps: true }
);

export const RoomModel = models.Room || model<IRoom>("Room", RoomSchema);
