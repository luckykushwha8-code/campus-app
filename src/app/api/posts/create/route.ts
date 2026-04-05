import { connectDB } from "@/lib/db";
import { serializeFeedPost } from "@/lib/post-serialization";
import { checkRateLimit, createRateLimitResponse, getRateLimitKey } from "@/lib/rate-limit";
import { getRequestUser } from "@/lib/request-auth";
import { PostModel } from "@/models/Post";

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const rateLimit = checkRateLimit({
      key: getRateLimitKey(req, "posts:create", String(user._id)),
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse("You are posting too quickly. Try again in a few minutes.", rateLimit.resetAt);
    }

    const body = await req.json();
    const content = String(body.content || "").trim();
    const images = Array.isArray(body.images)
      ? body.images.filter((item: unknown) => typeof item === "string" && item.trim()).slice(0, 4)
      : [];
    const isAnonymous = Boolean(body.isAnonymous);
    const audience = body.audience === "class" || body.audience === "public" ? body.audience : "campus";

    if (!content && !images.length) {
      return new Response(JSON.stringify({ ok: false, error: "Add some text or an image before posting." }), { status: 400 });
    }

    if (content.length > 2000) {
      return new Response(JSON.stringify({ ok: false, error: "Posts must stay under 2000 characters." }), { status: 400 });
    }

    const post = await PostModel.create({
      authorId: String(user._id),
      content,
      images,
      isAnonymous,
      audience,
      campusId: user.collegeId || "",
      campusName: user.collegeName || "",
      moderationStatus: "active",
      reportCount: 0,
    });

    return new Response(JSON.stringify({ ok: true, post: serializeFeedPost(post.toObject(), user, String(user._id)) }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to create your post right now." }), { status: 500 });
  }
}
