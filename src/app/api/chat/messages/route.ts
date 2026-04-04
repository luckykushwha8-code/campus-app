import { connectDB } from "@/lib/db";
import { defaultConversations, defaultMessages } from "@/lib/chat-data";
import { getServerSession } from "@/lib/server-auth";
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
    const session = await getServerSession();
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");

    if (conversationId) {
      const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 }).limit(100).lean();
      return Response.json({
        ok: true,
        messages: messages.map((message: any) => ({
          id: String(message._id),
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderName: message.senderName || "Campus User",
          senderAvatar: message.senderAvatar || "",
          content: message.content,
          createdAt: new Date(message.createdAt).toISOString(),
          isOwn: session ? message.senderId === session.userId : false,
        })),
      });
    }

    const conversations = await ConversationModel.find().sort({ lastActivity: -1 }).lean();
    return Response.json({
      ok: true,
      conversations: conversations.map((conversation: any) => ({
        id: String(conversation._id),
        name: conversation.name,
        avatar: conversation.avatar || "",
        lastMessage: conversation.lastMessage || "Start the conversation",
        time: conversation.lastActivity ? new Date(conversation.lastActivity).toISOString() : new Date().toISOString(),
        unread: 0,
        isGroup: Boolean(conversation.isGroup),
      })),
    });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
