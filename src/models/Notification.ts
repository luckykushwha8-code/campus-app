import { Schema, model, Document } from "mongoose";

export type NotificationType = "like" | "comment" | "follow" | "message" | "system";

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  payload?: any;
  isRead?: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ["like","comment","follow","message","system"], required: true },
  payload: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const NotificationModel = model<INotification>("Notification", NotificationSchema);
export default NotificationModel;
