import { connectDB } from '@/lib/db';
import { MessageModel, ConversationModel } from '@/models/Chat';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    const payload = verifyToken(token) as any;
    if (!payload?.userId) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    const body = await req.json();
    const { conversationId, content } = body;
    await connectDB();
    // Ensure conversation exists or create a new one
    let conv = await ConversationModel.findById(conversationId);
    if (!conv) {
      conv = await ConversationModel.create({ isGroup: false, participantIds: [payload.userId] });
    }
    await MessageModel.create({ conversationId: conv._id, senderId: payload.userId, content });
    return new Response(JSON.stringify({ ok: true }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), { status: 500 });
  }
}
