import { connectDB } from "@/lib/db";
import { getRequestUser } from "@/lib/request-auth";
import { serializeConversations } from "@/lib/chat-serialization";
import { ConversationModel } from "@/models/Chat";
import { UserModel } from "@/models/User";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);

    if (!user?._id) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return Response.json({ ok: false, error: "Enter the recipient email." }, { status: 400 });
    }

    const recipient = await UserModel.findOne({ email }).lean();
    if (!recipient) {
      return Response.json({ ok: false, error: "No CampusLink account found for that email." }, { status: 404 });
    }

    const currentUserId = String(user._id);
    const recipientId = String(recipient._id);
    if (recipientId === currentUserId) {
      return Response.json({ ok: false, error: "You already have access to your own account." }, { status: 400 });
    }

    let conversation = await ConversationModel.findOne({
      isGroup: false,
      participantIds: { $all: [currentUserId, recipientId] },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        isGroup: false,
        participantIds: [currentUserId, recipientId],
        name: recipient.name || recipient.email.split("@")[0],
        slug: `${slugify(user.email)}-${slugify(recipient.email)}-${Date.now()}`,
        createdBy: currentUserId,
        lastActivity: new Date(),
      });
    }

    const serialized = await serializeConversations([conversation.toObject()], currentUserId);
    return Response.json({ ok: true, conversation: serialized[0] }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "Unable to start a conversation right now." }, { status: 500 });
  }
}
