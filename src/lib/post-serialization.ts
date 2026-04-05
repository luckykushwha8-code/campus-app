import { buildUsername } from "@/lib/username";

export function serializeFeedPost(post: any, author: any, currentUserId?: string | null) {
  return {
    id: String(post._id),
    content: post.content || "",
    images: Array.isArray(post.images) ? post.images : [],
    createdAt: post.createdAt,
    likesCount: Number(post.likesCount || 0),
    commentsCount: Number(post.commentsCount || 0),
    isLiked: currentUserId ? (post.likes || []).includes(currentUserId) : false,
    isOwner: currentUserId ? String(post.authorId) === currentUserId : false,
    canReport: currentUserId ? String(post.authorId) !== currentUserId : false,
    isAnonymous: Boolean(post.isAnonymous),
    author: post.isAnonymous
      ? {
          id: "anonymous",
          name: "Anonymous",
          username: "anonymous",
          avatarUrl: "",
          institution: post.campusName || "",
          isVerified: false,
        }
      : {
          id: author ? String(author._id) : String(post.authorId),
          name: author?.name || "Student",
          username: author?.username || buildUsername(author?.name, author?.email),
          avatarUrl: author?.avatarUrl || "",
          institution: author?.collegeName || post.campusName || "",
          isVerified: Boolean(author?.verified),
        },
  };
}
