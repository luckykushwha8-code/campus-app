import { connectDB } from "@/lib/db";
import { checkRateLimit, createRateLimitResponse, getRateLimitKey } from "@/lib/rate-limit";
import { getRequestUserId } from "@/lib/request-auth";
import { StoryModel } from "@/models/Story";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const rateLimit = checkRateLimit({
      key: getRateLimitKey(req, "stories:create", userId),
      limit: 12,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse("You have reached the story sharing limit for now. Try again later.", rateLimit.resetAt);
    }

    await connectDB();
    const body = await req.json();
    const url = String(body.url || "").trim();
    const caption = String(body.caption || "").trim().slice(0, 160);
    const type = body.type === "video" ? "video" : "image";

    if (!url) {
      return new Response(JSON.stringify({ ok: false, error: "Story image is required." }), { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const story = await StoryModel.create({ userId, url, caption, type, expiresAt });
    const user = await UserModel.findById(userId).lean();

    return new Response(
      JSON.stringify({
        ok: true,
        story: {
          id: String(story._id),
          url: story.url,
          type: story.type,
          caption: story.caption || "",
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
          isOwnStory: true,
          author: {
            id: userId,
            name: user?.name || user?.email?.split("@")[0] || "You",
            avatarUrl: user?.avatarUrl || "",
          },
        },
      }),
      { status: 201 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to create story right now." }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const storyId = String(body.storyId || "");
    if (!storyId) {
      return new Response(JSON.stringify({ ok: false, error: "Story is required." }), { status: 400 });
    }

    const story = await StoryModel.findById(storyId);
    if (!story) {
      return new Response(JSON.stringify({ ok: false, error: "Story not found." }), { status: 404 });
    }

    if (String(story.userId) !== userId) {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    }

    await story.deleteOne();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to delete story right now." }), { status: 500 });
  }
}
