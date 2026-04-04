import { connectDB } from "@/lib/db";
import { getRequestUserId } from "@/lib/request-auth";
import { CommentModel } from "@/models/Comment";
import { PostModel } from "@/models/Post";

export async function DELETE(_req: Request, context: any) {
  try {
    await connectDB();
    const userId = await getRequestUserId(_req);
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const { id } = await context.params;
    const post = await PostModel.findById(id);
    if (!post) {
      return new Response(JSON.stringify({ ok: false, error: "Post not found." }), { status: 404 });
    }

    if (String(post.authorId) !== userId) {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    }

    await CommentModel.deleteMany({ postId: String(post._id) });
    await PostModel.findByIdAndDelete(id);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to delete the post right now." }), { status: 500 });
  }
}
