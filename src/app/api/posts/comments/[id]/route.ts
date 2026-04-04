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
    const comment = await CommentModel.findById(id);
    if (!comment) {
      return new Response(JSON.stringify({ ok: false, error: "Comment not found." }), { status: 404 });
    }

    if (String(comment.authorId) !== userId) {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    }

    await CommentModel.findByIdAndDelete(id);
    await PostModel.findByIdAndUpdate(comment.postId, {
      $inc: { commentsCount: -1 },
    });

    return new Response(JSON.stringify({ ok: true, postId: String(comment.postId) }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to delete the comment right now." }), { status: 500 });
  }
}
