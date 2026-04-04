import { UserModel } from "@/models/User";

function buildUsername(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "student";
  return (
    source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "student"
  );
}

export async function serializeConversations(conversations: any[], currentUserId: string) {
  const otherParticipantIds = Array.from(
    new Set(
      conversations
        .filter((conversation) => !conversation.isGroup)
        .flatMap((conversation) => conversation.participantIds || [])
        .filter((participantId: string) => participantId && participantId !== currentUserId)
    )
  );

  const participants = otherParticipantIds.length
    ? await UserModel.find({ _id: { $in: otherParticipantIds } }).lean()
    : [];
  const participantMap = new Map(participants.map((participant) => [String(participant._id), participant]));

  return conversations.map((conversation) => {
    const participantId = !conversation.isGroup
      ? (conversation.participantIds || []).find((id: string) => id !== currentUserId)
      : null;
    const participant = participantId ? participantMap.get(String(participantId)) : null;

    return {
      id: String(conversation._id),
      name: conversation.isGroup ? conversation.name : participant?.name || conversation.name,
      avatar: conversation.isGroup ? conversation.avatar || "" : participant?.avatarUrl || "",
      lastMessage: conversation.lastMessage || "Start the conversation",
      time: conversation.lastActivity ? new Date(conversation.lastActivity).toISOString() : new Date().toISOString(),
      unread: 0,
      isGroup: Boolean(conversation.isGroup),
      canCreateMessages: true,
      subtitle: conversation.isGroup
        ? "Group conversation"
        : participant
          ? `@${buildUsername(participant.name, participant.email)}`
          : "Direct conversation",
    };
  });
}

export function serializeMessage(message: any, currentUserId: string) {
  return {
    id: String(message._id),
    conversationId: String(message.conversationId),
    senderId: String(message.senderId),
    senderName: message.senderName || "Campus User",
    senderAvatar: message.senderAvatar || "",
    content: message.content,
    createdAt: new Date(message.createdAt).toISOString(),
    isOwn: String(message.senderId) === currentUserId,
  };
}
