import { connectDB } from "@/lib/db";
import { getRequestUser } from "@/lib/request-auth";
import { PostModel } from "@/models/Post";

function buildUsername(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "student";
  return (
    source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "student"
  );
}

function serializePost(post: any, author: any) {
  return {
    id: String(post._id),
    content: post.content || "",
    images: Array.isArray(post.images) ? post.images : [],
    createdAt: post.createdAt,
    likesCount: Number(post.likesCount || 0),
    commentsCount: Number(post.commentsCount || 0),
    isLiked: false,
    isOwner: true,
    isAnonymous: Boolean(post.isAnonymous),
    author: post.isAnonymous
      ? {
          id: "anonymous",
          name: "Anonymous",
          username: "anonymous",
          avatarUrl: "",
          institution: author?.collegeName || "",
          isVerified: false,
        }
      : {
          id: String(author._id),
          name: author.name || "Student",
          username: buildUsername(author.name, author.email),
          avatarUrl: author.avatarUrl || "",
          institution: author.collegeName || "",
          isVerified: Boolean(author.verified),
        },
  };
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
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
    });

    return new Response(JSON.stringify({ ok: true, post: serializePost(post.toObject(), user) }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to create your post right now." }), { status: 500 });
  }
}
