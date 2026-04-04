import { connectDB } from "@/lib/db";
import { createPasswordResetToken, isPasswordResetEmailConfigured, sendPasswordResetEmail } from "@/lib/password-reset";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: "Enter your email address." }), { status: 400 });
    }

    if (!isPasswordResetEmailConfigured()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Password reset email is not configured yet. Add SMTP settings to enable it." }),
        { status: 503 }
      );
    }

    await connectDB();
    const user = await UserModel.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ ok: true, message: "If that email exists, a reset link has been sent." }),
        { status: 200 }
      );
    }

    const { rawToken, tokenHash, expiresAt } = createPasswordResetToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token: rawToken,
      origin: req.headers.get("origin"),
    });

    return new Response(
      JSON.stringify({ ok: true, message: "If that email exists, a reset link has been sent." }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to send the reset email right now." }), { status: 500 });
  }
}
