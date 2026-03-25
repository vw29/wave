"use server";

import { forgotPasswordSchema, ForgotPasswordSchema } from "@/lib/schemas";
import { validateInput } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/ratelimit";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Resend } from "resend";
import { PasswordResetEmail } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

const GENERIC_SUCCESS = {
  success: true,
  message: "If an account with that email exists, a reset link has been sent.",
};

export async function forgotPassword(data: ForgotPasswordSchema) {
  const session = await auth();
  if (session?.user?.id) {
    return { success: false, message: "You are already logged in" };
  }

  const rateLimitError = await enforceRateLimit(null, "forgotPassword");
  if (rateLimitError) return rateLimitError;

  const validated = validateInput(forgotPasswordSchema, data);
  if (!validated.success) return validated;

  const { email } = validated.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, username: true },
  });

  if (!user) return GENERIC_SUCCESS;

  const perUserRateLimitError = await enforceRateLimit(
    user.email,
    "forgotPassword",
  );
  if (perUserRateLimitError) return perUserRateLimitError;

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token: hashedToken, expiresAt, userId: user.id },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const username = user.name ?? user.username ?? user.email;

  await resend.emails.send({
    from: "Wave <onboarding@resend.dev>",
    to: user.email,
    subject: "Reset your Wave password",
    html: PasswordResetEmail({ username, resetUrl }),
  });

  return GENERIC_SUCCESS;
}
