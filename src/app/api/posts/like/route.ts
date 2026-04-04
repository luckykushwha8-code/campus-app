import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notification-service";
import { getRequestUser } from "@/lib/request-auth";
import { PostModel } from "@/models/Post";

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing post." }), { status: 400 });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return new Response(JSON.stringify({ ok: false, error: "Post not found." }), { status: 404 });
    }

    const userId = String(user._id);
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter((id: string) => id !== userId);
      post.likesCount = Math.max(0, Number(post.likesCount || 0) - 1);
    } else {
      post.likes.push(userId);
      post.likesCount = Number(post.likesCount || 0) + 1;

      if (String(post.authorId) !== userId) {
        await createNotification({
          userId: String(post.authorId),
          type: "like",
          payload: {
            actorId: userId,
            actorName: user.name || "",
            actorAvatarUrl: user.avatarUrl || "",
            postId: String(post._id),
          },
        });
      }
    }

    await post.save();

    return new Response(
      JSON.stringify({
        ok: true,
        liked: !hasLiked,
        likesCount: post.likesCount,
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to update the like right now." }), { status: 500 });
  }
}
