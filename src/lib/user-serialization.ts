import { DEFAULT_USER_SETTINGS } from "@/lib/app-session";
import { buildUsername } from "@/lib/username";

export function serializePrivateUser(user: any) {
  return {
    id: String(user._id || user.id),
    email: user.email || "",
    name: user.name || (user.email ? user.email.split("@")[0] : "student"),
    username: user.username || buildUsername(user.name, user.email),
    role: user.role === "admin" ? "admin" : "student",
    bio: user.bio || "",
    collegeName: user.collegeName || "",
    collegeId: user.collegeId || "",
    avatarUrl: user.avatarUrl || "",
    coverUrl: user.coverUrl || "",
    settings: {
      ...DEFAULT_USER_SETTINGS,
      ...(user.settings || {}),
    },
    verified: Boolean(user.verified),
    updatedAt: user.updatedAt || null,
  };
}

export function serializePublicUser(user: any) {
  return {
    id: String(user._id || user.id),
    name: user.name || (user.email ? user.email.split("@")[0] : "student"),
    username: user.username || buildUsername(user.name, user.email),
    bio: user.bio || "",
    collegeName: user.collegeName || "",
    collegeId: user.collegeId || "",
    avatarUrl: user.avatarUrl || "",
    coverUrl: user.coverUrl || "",
    verified: Boolean(user.verified),
    followers: Array.isArray(user.followers) ? user.followers.length : 0,
    following: Array.isArray(user.following) ? user.following.length : 0,
    updatedAt: user.updatedAt || null,
  };
}
