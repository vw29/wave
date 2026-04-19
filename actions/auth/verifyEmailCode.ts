"use server";

import prisma from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/ratelimit";
import { hashPassword } from "@/lib/password";

interface VerifyAndCreateParams {
  email: string;
  code: string;
  username: string;
  password: string;
}

/**
 * Verify the email code and create the user account.
 * The user is only added to the database after successful verification.
 */
export async function verifyEmailCode({
  email,
  code,
  username,
  password,
}: VerifyAndCreateParams) {
  const rateLimitError = await enforceRateLimit(email, "verifyEmailCode");
  if (rateLimitError) return rateLimitError;

  const record = await prisma.emailVerificationCode.findFirst({
    where: { email },
    orderBy: { expiresAt: "desc" },
  });

  if (!record) {
    return { success: false, message: "No verification code found. Please request a new one." };
  }

  if (new Date() > record.expiresAt) {
    await prisma.emailVerificationCode.delete({ where: { id: record.id } });
    return { success: false, message: "Code has expired. Please request a new one." };
  }

  if (record.code !== code) {
    return { success: false, message: "Invalid code. Please try again." };
  }

  // Code is valid — clean up codes and create the user
  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction([
      prisma.emailVerificationCode.deleteMany({ where: { email } }),
      prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
        },
      }),
    ]);
  } catch {
    return { success: false, message: "Failed to create account. Username or email may already be taken." };
  }

  return { success: true };
}
