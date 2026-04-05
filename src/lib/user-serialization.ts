import { DEFAULT_USER_SETTINGS } from "@/lib/app-session";

export function serializePrivateUser(user: any) {
  return {
    id: String(user._id || user.id),
    email: user.email || "",
    name: user.name || (user.email ? user.email.split("@")[0] : "student"),
    username:
      (user.name || user.email || "student")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "student",
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
  };
}

export function serializePublicUser(user: any) {
  return {
    id: String(user._id || user.id),
    name: user.name || (user.email ? user.email.split("@")[0] : "student"),
    bio: user.bio || "",
    collegeName: user.collegeName || "",
    avatarUrl: user.avatarUrl || "",
    coverUrl: user.coverUrl || "",
    verified: Boolean(user.verified),
    followers: Array.isArray(user.followers) ? user.followers.length : 0,
    following: Array.isArray(user.following) ? user.following.length : 0,
  };
}
