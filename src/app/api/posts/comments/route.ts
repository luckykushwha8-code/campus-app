import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notification-service";
import { checkRateLimit, createRateLimitResponse, getRateLimitKey } from "@/lib/rate-limit";
import { getRequestUser, getRequestUserId } from "@/lib/request-auth";
import { CommentModel } from "@/models/Comment";
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

function serializeComment(comment: any, author: any, currentUserId?: string | null) {
  return {
    id: String(comment._id),
    postId: String(comment.postId),
    content: comment.content || "",
    createdAt: comment.createdAt,
    isOwner: currentUserId ? String(comment.authorId) === currentUserId : false,
    canReport: currentUserId ? String(comment.authorId) !== currentUserId : false,
    author: {
      id: author ? String(author._id) : String(comment.authorId),
      name: author?.name || "Student",
      username: buildUsername(author?.name, author?.email),
      avatarUrl: author?.avatarUrl || "",
    },
  };
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing post." }), { status: 400 });
    }

    const currentUserId = await getRequestUserId(req);
    const comments = await CommentModel.find({ postId, moderationStatus: { $ne: "reported" } }).sort({ createdAt: 1 }).limit(100).lean();
    const authorIds = Array.from(new Set(comments.map((comment) => String(comment.authorId))));
    const authors = authorIds.length ? await UserModel.find({ _id: { $in: authorIds } }).lean() : [];
    const authorMap = new Map(authors.map((author) => [String(author._id), author]));

    return new Response(
      JSON.stringify({
        ok: true,
        comments: comments.map((comment) => serializeComment(comment, authorMap.get(String(comment.authorId)), currentUserId)),
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to load comments right now." }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const rateLimit = checkRateLimit({
      key: getRateLimitKey(req, "posts:comments", String(user._id)),
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse("You are commenting too quickly. Please slow down for a moment.", rateLimit.resetAt);
    }

    const body = await req.json();
    const postId = String(body.postId || "").trim();
    const content = String(body.content || "").trim();

    if (!postId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing post." }), { status: 400 });
    }

    if (!content) {
      return new Response(JSON.stringify({ ok: false, error: "Comment cannot be empty." }), { status: 400 });
    }

    if (content.length > 500) {
      return new Response(JSON.stringify({ ok: false, error: "Comments must stay under 500 characters." }), { status: 400 });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return new Response(JSON.stringify({ ok: false, error: "Post not found." }), { status: 404 });
    }

    const comment = await CommentModel.create({
      postId: String(post._id),
      authorId: String(user._id),
      content,
      moderationStatus: "active",
      reportCount: 0,
    });

    post.commentsCount = Number(post.commentsCount || 0) + 1;
    await post.save();

    if (String(post.authorId) !== String(user._id)) {
      await createNotification({
        userId: String(post.authorId),
        type: "comment",
        payload: {
          actorId: String(user._id),
          actorName: user.name || "",
          actorAvatarUrl: user.avatarUrl || "",
          postId: String(post._id),
          commentId: String(comment._id),
          message: content,
        },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        comment: serializeComment(comment.toObject(), user, String(user._id)),
        commentsCount: post.commentsCount,
      }),
      { status: 201 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to add your comment right now." }), { status: 500 });
  }
}
