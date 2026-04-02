import { ChatSidebar, ChatWindow } from "@/components/chat";

export default function MessagesPage() {
  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <ChatWindow
        conversationId="1"
        conversationName="CSE 2025 Group"
        isGroup={true}
      />
    </div>
  );
}
