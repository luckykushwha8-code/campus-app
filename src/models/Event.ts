import { Schema, model, models, Document } from "mongoose";

export interface IEvent extends Document {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  location: string;
  startDate: Date;
  organizerName: string;
  attendeeIds: string[];
  creatorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    location: { type: String, required: true },
    startDate: { type: Date, required: true, index: true },
    organizerName: { type: String, required: true },
    attendeeIds: { type: [String], default: [] },
    creatorId: { type: String },
  },
  { timestamps: true }
);

export const EventModel = models.Event || model<IEvent>("Event", EventSchema);
