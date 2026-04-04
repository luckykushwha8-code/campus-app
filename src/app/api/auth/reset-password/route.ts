import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || "").trim();
    const password = String(body.password || "");

    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: "Missing reset token." }), { status: 400 });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ ok: false, error: "Use a password with at least 8 characters." }), { status: 400 });
    }

    await connectDB();
    const tokenHash = hashPasswordResetToken(token);
    const user = await UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "This reset link is invalid or has expired." }), { status: 400 });
    }

    user.passwordHash = await hashPassword(password);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return new Response(JSON.stringify({ ok: true, message: "Password updated successfully." }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to reset the password right now." }), { status: 500 });
  }
}
