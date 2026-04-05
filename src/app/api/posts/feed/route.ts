import { connectDB } from "@/lib/db";
import { serializeFeedPost } from "@/lib/post-serialization";
import { getRequestUserId } from "@/lib/request-auth";
import { PostModel } from "@/models/Post";
import { UserModel } from "@/models/User";

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
        posts: slicedPosts.map((post) => serializeFeedPost(post, authorMap.get(String(post.authorId)), currentUserId)),
        nextCursor: hasMore ? String(slicedPosts[slicedPosts.length - 1]?._id || "") : null,
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to load the feed right now." }), { status: 500 });
  }
}
