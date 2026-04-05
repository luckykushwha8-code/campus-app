import { connectDB } from "@/lib/db";
import { getRequestUserId } from "@/lib/request-auth";
import { StoryModel } from "@/models/Story";
import { UserModel } from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const now = new Date();
    await StoryModel.deleteMany({ expiresAt: { $lte: now } });

    const viewerId = await getRequestUserId(req);
    const stories = await StoryModel.find({ expiresAt: { $gt: now } }).sort({ createdAt: -1 }).limit(100).lean();
    const userIds = [...new Set(stories.map((story: any) => String(story.userId)))];
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(
      users.map((user: any) => [
        String(user._id),
        {
          id: String(user._id),
          name: user.name || user.email?.split("@")[0] || "Student",
          avatarUrl: user.avatarUrl || "",
        },
      ])
    );

    return new Response(
      JSON.stringify({
        ok: true,
        stories: stories.map((story: any) => ({
          id: String(story._id),
          url: story.url,
          type: story.type,
          caption: story.caption || "",
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
          isOwnStory: viewerId ? String(story.userId) === viewerId : false,
          author: userMap.get(String(story.userId)) || {
            id: String(story.userId),
            name: "Student",
            avatarUrl: "",
          },
        })),
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to load stories right now." }), { status: 500 });
  }
}
