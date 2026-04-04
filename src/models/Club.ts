import { Schema, model, models, Document } from "mongoose";

export interface IClub extends Document {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  memberIds: string[];
  creatorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    memberIds: { type: [String], default: [] },
    creatorId: { type: String },
  },
  { timestamps: true }
);

export const ClubModel = models.Club || model<IClub>("Club", ClubSchema);
