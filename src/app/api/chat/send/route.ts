import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notification-service";
import { getRequestUser } from "@/lib/request-auth";
import { serializeMessage } from "@/lib/chat-serialization";
import { ConversationModel, MessageModel } from "@/models/Chat";

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);
    if (!user?._id) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const conversationId = String(body.conversationId || "").trim();
    const content = String(body.content || "").trim();

    if (!conversationId || !content) {
      return Response.json({ ok: false, error: "Enter a message before sending." }, { status: 400 });
    }

    if (content.length > 1000) {
      return Response.json({ ok: false, error: "Messages must stay under 1000 characters." }, { status: 400 });
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      return Response.json({ ok: false, error: "Conversation not found." }, { status: 404 });
    }

    const currentUserId = String(user._id);
    if (!conversation.isGroup && !conversation.participantIds.includes(currentUserId)) {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    if (conversation.isGroup && !conversation.participantIds.includes(currentUserId)) {
      conversation.participantIds = [...new Set([...conversation.participantIds, currentUserId])];
    }

    const message = await MessageModel.create({
      conversationId: String(conversation._id),
      senderId: currentUserId,
      senderName: user.name || "Campus User",
      senderAvatar: user.avatarUrl || "",
      content,
    });

    conversation.lastMessage = content;
    conversation.lastActivity = new Date();
    await conversation.save();

    if (!conversation.isGroup) {
      const recipientId = (conversation.participantIds || []).find((id: string) => id !== currentUserId);
      if (recipientId) {
        await createNotification({
          userId: recipientId,
          type: "message",
          payload: {
            actorId: currentUserId,
            actorName: user.name || "",
            actorAvatarUrl: user.avatarUrl || "",
            message: content,
          },
        });
      }
    }

    return Response.json(
      {
        ok: true,
        message: serializeMessage(message.toObject(), currentUserId),
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ ok: false, error: "Unable to send message right now." }, { status: 500 });
  }
}
