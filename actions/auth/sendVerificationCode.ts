"use server";

import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { VerificationCodeEmail } from "@/components/email-template";
import { enforceRateLimit } from "@/lib/ratelimit";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a 6-digit verification code to the given email.
 * Works before the user exists in the database.
 */
export async function sendVerificationCode(email: string, username?: string) {
  const rateLimitError = await enforceRateLimit(email, "verifyEmail");
  if (rateLimitError) return rateLimitError;

  // Delete any existing codes for this email
  await prisma.emailVerificationCode.deleteMany({
    where: { email },
  });

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.emailVerificationCode.create({
    data: {
      code,
      email,
      expiresAt,
    },
  });

  const displayName = username ?? email.split("@")[0];

  await resend.emails.send({
    from: "Wave <onboarding@resend.dev>",
    to: email,
    subject: "Your Wave verification code",
    html: VerificationCodeEmail({ username: displayName, code }),
  });

  return { success: true };
}
