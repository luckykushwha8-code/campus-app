import { connectDB } from "@/lib/db";
import { getRequestUserId } from "@/lib/request-auth";
import { PostModel } from "@/models/Post";
import { UserModel } from "@/models/User";

function buildUsername(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "student";
  return (
    source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "student"
  );
}

function serializePost(post: any, author: any, currentUserId?: string | null) {
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
          username: buildUsername(author?.name, author?.email),
          avatarUrl: author?.avatarUrl || "",
          institution: author?.collegeName || post.campusName || "",
          isVerified: Boolean(author?.verified),
        },
  };
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "10", 10), 1), 20);
    const cursor = url.searchParams.get("cursor");
    const authorId = url.searchParams.get("authorId");
    const currentUserId = await getRequestUserId(req);

    const query: Record<string, unknown> = {};
    query.moderationStatus = { $ne: "reported" };
    if (authorId) {
      query.authorId = authorId;
    }
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await PostModel.find(query).sort({ _id: -1 }).limit(limit + 1).lean();
    const hasMore = posts.length > limit;
    const slicedPosts = hasMore ? posts.slice(0, limit) : posts;

    const authorIds = Array.from(
      new Set(
        slicedPosts
          .filter((post) => !post.isAnonymous)
          .map((post) => String(post.authorId))
      )
    );
    const authors = authorIds.length
      ? await UserModel.find({ _id: { $in: authorIds } }).lean()
      : [];
    const authorMap = new Map(authors.map((author) => [String(author._id), author]));

    return new Response(
      JSON.stringify({
        ok: true,
        posts: slicedPosts.map((post) => serializePost(post, authorMap.get(String(post.authorId)), currentUserId)),
        nextCursor: hasMore ? String(slicedPosts[slicedPosts.length - 1]?._id || "") : null,
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to load the feed right now." }), { status: 500 });
  }
}
