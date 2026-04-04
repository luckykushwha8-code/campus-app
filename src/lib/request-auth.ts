import { verifyToken } from "@/lib/auth";
import { getBearerToken, getServerSession } from "@/lib/server-auth";
import { UserModel } from "@/models/User";

export async function getRequestUserId(request: Request) {
  const session = await getServerSession();
  if (session?.userId) {
    return session.userId;
  }

  const bearerToken = getBearerToken(request);
  const payload = bearerToken ? (verifyToken(bearerToken) as { userId?: string } | null) : null;
  return payload?.userId || null;
}

export async function getRequestUser(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return null;
  }

  return UserModel.findById(userId);
}
