import { Schema, model, Document } from "mongoose";

export interface IMessage {
  conversationId: string;
  senderId: string;
  content: string;
  createdAt?: Date;
}

export interface IConversation {
  _id: string;
  isGroup: boolean;
  participantIds: string[];
  lastActivity?: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  content: { type: String, required: true },
}, { timestamps: true });

const ConversationSchema = new Schema<IConversation>({
  isGroup: { type: Boolean, default: false },
  participantIds: { type: [String], default: [] },
}, { timestamps: true });

export const MessageModel = model("Message", MessageSchema);
export const ConversationModel = model("Conversation", ConversationSchema);

const ChatModels = { MessageModel, ConversationModel };

export default ChatModels;
