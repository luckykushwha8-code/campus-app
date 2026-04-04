import crypto from "crypto";
import nodemailer from "nodemailer";

const resetWindowMs = 1000 * 60 * 30;

function getBaseUrl(origin?: string | null) {
  return (process.env.NEXT_PUBLIC_APP_URL || origin || "http://localhost:3000").replace(/\/+$/, "");
}

export function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + resetWindowMs);

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isPasswordResetEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_PORT?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      process.env.SMTP_FROM_EMAIL?.trim()
  );
}

async function getTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !port || !user || !pass) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendPasswordResetEmail({
  email,
  name,
  token,
  origin,
}: {
  email: string;
  name?: string;
  token: string;
  origin?: string | null;
}) {
  const from = process.env.SMTP_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  const transporter = await getTransporter();
  const resetUrl = `${getBaseUrl(origin)}\/reset-password?token=${encodeURIComponent(token)}`;
  const displayName = name?.trim() || email.split("@")[0];

  await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your CampusLink password",
    text: `Hi ${displayName},\n\nUse this link to reset your CampusLink password:\n${resetUrl}\n\nThis link expires in 30 minutes.\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${displayName},</p>
        <p>Use the button below to reset your CampusLink password. This link expires in 30 minutes.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 18px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; font-weight: 600;">
            Reset password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
