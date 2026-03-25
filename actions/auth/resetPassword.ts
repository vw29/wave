"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/schemas";
import { validateInput } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/ratelimit";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";

export async function resetPassword(data: ResetPasswordSchema, token: string) {
  const rateLimitError = await enforceRateLimit(token, "resetPassword");
  if (rateLimitError) return rateLimitError;

  const session = await auth();
  if (session?.user?.id) {
    return { success: false, message: "You are already logged in" };
  }

  const validated = validateInput(resetPasswordSchema, data);
  if (!validated.success) return validated;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const databaseToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!databaseToken) {
    return { success: false, message: "Invalid token" };
  }

  if (databaseToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: databaseToken.id },
    });
    return { success: false, message: "Token has expired" };
  }

  const user = await prisma.user.findUnique({
    where: { id: databaseToken.userId },
    select: { id: true },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const passwordHash = await hashPassword(data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({
      where: { id: databaseToken.id },
    }),
  ]);

  return { success: true };
}
