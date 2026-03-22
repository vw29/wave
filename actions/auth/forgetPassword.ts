"use server";

import { forgetPasswordSchema, ForgetPasswordSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/ratelimit";
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

export async function forgetPassword(data: ForgetPasswordSchema) {
  const session = await auth();

  if (session?.user?.id) {
    return { success: false, message: "You are already logged in" };
  }

  try {
    await checkRateLimit(null, "forgetPassword");
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return { success: false, message: "Too many requests" };
    }
    throw error;
  }

  const result = forgetPasswordSchema.safeParse(data);

  if (!result.success) {
    return { success: false, message: "Invalid data" };
  }

  const { email } = result.data;

  const user = await prisma?.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, username: true },
  });

  // Return generic message whether user exists or not to prevent email enumeration
  if (!user) return GENERIC_SUCCESS;

  try {
    await checkRateLimit(user.email, "forgetPassword");
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return { success: false, message: "Too many requests" };
    }
    throw error;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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
