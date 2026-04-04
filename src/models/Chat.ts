import { Schema, model, models, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  isGroup: boolean;
  participantIds: string[];
  name: string;
  slug: string;
  avatar?: string;
  lastMessage?: string;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  senderName: { type: String },
  senderAvatar: { type: String },
  content: { type: String, required: true },
}, { timestamps: true });

const ConversationSchema = new Schema<IConversation>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  avatar: { type: String },
  isGroup: { type: Boolean, default: false },
  participantIds: { type: [String], default: [] },
  lastMessage: { type: String },
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

export const MessageModel = models.Message || model<IMessage>("Message", MessageSchema);
export const ConversationModel = models.Conversation || model<IConversation>("Conversation", ConversationSchema);

const ChatModels = { MessageModel, ConversationModel };

export default ChatModels;
