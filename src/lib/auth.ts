import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserModel } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

type JwtExpiresIn = jwt.SignOptions["expiresIn"];

export function signToken(payload: object, expiresIn: JwtExpiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function ensureUserFromToken(token: string) {
  const data = verifyToken(token);
  if (!data?.userId) return null;
  const user = await UserModel.findById(data.userId).lean();
  return user;
}
