import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name?: string;
  bio?: string;
  collegeId?: string;
  collegeName?: string;
  avatarUrl?: string;
  coverUrl?: string;
  settings?: {
    pushNotifications: boolean;
    roomAlerts: boolean;
    emailUpdates: boolean;
    profileVisible: boolean;
    showCollegeDetails: boolean;
    showActivityStatus: boolean;
    publicProfile: boolean;
  };
  role: "student" | "admin";
  verified?: boolean;
  followers: string[];
  following: string[];
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  name: { type: String },
  bio: { type: String },
  collegeId: { type: String, index: true },
  collegeName: { type: String },
  avatarUrl: { type: String },
  coverUrl: { type: String },
  settings: {
    pushNotifications: { type: Boolean, default: true },
    roomAlerts: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: false },
    profileVisible: { type: Boolean, default: true },
    showCollegeDetails: { type: Boolean, default: true },
    showActivityStatus: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: false },
  },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  verified: { type: Boolean, default: false },
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  passwordResetTokenHash: { type: String, default: null },
  passwordResetExpiresAt: { type: Date, default: null, index: true },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

export const UserModel = models.User || model<IUser>("User", UserSchema);
export default UserModel;
