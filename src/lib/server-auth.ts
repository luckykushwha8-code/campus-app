import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const AUTH_COOKIE = "campuslink_token";

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token) as { userId?: string } | null;
  if (!payload?.userId) {
    return null;
  }

  return {
    token,
    userId: payload.userId,
  };
}

export function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}
