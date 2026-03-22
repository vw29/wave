"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/schemas";
import argon2 from "argon2";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/ratelimit";

export async function resetPassword(data: ResetPasswordSchema, token: string) {
  try {
    await checkRateLimit(token, "resetPassword");
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return { success: false, message: "Too many requests" };
    }
    throw error;
  }

  const session = await auth();
  if (session?.user?.id) {
    return { success: false, message: "You are already logged in" };
  }

  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Something went wrong",
    };
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const databaseToken = await prisma.passwordResetToken.findUnique({
    where: {
      token: hashedToken,
    },
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

  const passwordHash = await argon2.hash(data.password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

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
