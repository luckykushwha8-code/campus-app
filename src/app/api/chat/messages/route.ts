import { connectDB } from "@/lib/db";
import { getRequestUser } from "@/lib/request-auth";
import { serializeConversations, serializeMessage } from "@/lib/chat-serialization";
import { defaultConversations, defaultMessages } from "@/lib/chat-data";
import { ConversationModel, MessageModel } from "@/models/Chat";

async function ensureSeeded() {
  const count = await ConversationModel.countDocuments();
  if (count) return;

  const conversations = await ConversationModel.insertMany(
    defaultConversations.map((conversation) => ({
      ...conversation,
      lastActivity: new Date(),
    }))
  );

  const bySlug = new Map(conversations.map((conversation) => [conversation.slug, conversation]));

  for (const seedMessage of defaultMessages) {
    const conversation = bySlug.get(seedMessage.conversationSlug);
    if (!conversation) continue;

    await MessageModel.create({
      conversationId: String(conversation._id),
      senderId: seedMessage.senderName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      senderName: seedMessage.senderName,
      senderAvatar: seedMessage.senderAvatar,
      content: seedMessage.content,
    });

    conversation.lastMessage = seedMessage.content;
    conversation.lastActivity = new Date();
    await conversation.save();
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    await ensureSeeded();
    const user = await getRequestUser(req);

    if (!user?._id) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = String(user._id);
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");

    if (conversationId) {
      const conversation = await ConversationModel.findById(conversationId).lean();
      if (!conversation) {
        return Response.json({ ok: false, error: "Conversation not found." }, { status: 404 });
      }

      const canAccess =
        conversation.isGroup || (conversation.participantIds || []).includes(currentUserId);
      if (!canAccess) {
        return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
      }

      const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 }).limit(100).lean();
      return Response.json({
        ok: true,
        messages: messages.map((message: any) => serializeMessage(message, currentUserId)),
      });
    }

    const conversations = await ConversationModel.find({
      $or: [{ isGroup: true }, { participantIds: currentUserId }],
    })
      .sort({ lastActivity: -1 })
      .lean();

    return Response.json({
      ok: true,
      conversations: await serializeConversations(conversations, currentUserId),
    });
  } catch {
    return Response.json({ ok: false, error: "Unable to load conversations right now." }, { status: 500 });
  }
}
