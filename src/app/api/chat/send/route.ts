import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/server-auth";
import { ConversationModel, MessageModel } from "@/models/Chat";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const conversationId = body.conversationId;
    const content = body.content?.trim();

    if (!conversationId || !content) {
      return Response.json({ ok: false, error: "Missing message details" }, { status: 400 });
    }

    await connectDB();
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      return Response.json({ ok: false, error: "Conversation not found" }, { status: 404 });
    }

    if (!conversation.participantIds.includes(session.userId)) {
      conversation.participantIds = [...conversation.participantIds, session.userId];
    }

    const user = await UserModel.findById(session.userId).lean();
    const message = await MessageModel.create({
      conversationId: String(conversation._id),
      senderId: session.userId,
      senderName: user?.name || "Campus User",
      senderAvatar: user?.avatarUrl || "",
      content,
    });

    conversation.lastMessage = content;
    conversation.lastActivity = new Date();
    await conversation.save();

    return Response.json({
      ok: true,
      message: {
        id: String(message._id),
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.senderName || "Campus User",
        senderAvatar: message.senderAvatar || "",
        content: message.content,
        createdAt: new Date(message.createdAt).toISOString(),
        isOwn: true,
      },
    }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
