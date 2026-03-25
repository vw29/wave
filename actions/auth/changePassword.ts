"use server";

import { auth } from "@/auth";
import { ChangePasswordSchema, changePasswordSchema } from "@/lib/schemas";
import { validateInput } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/ratelimit";
import { hashPassword } from "@/lib/password";
import argon2 from "argon2";
import prisma from "@/lib/prisma";

export async function changePassword(data: ChangePasswordSchema) {
  const validated = validateInput(changePasswordSchema, data);
  if (!validated.success) return validated;

  const { currentPassword, newPassword } = validated.data;

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "You are not logged in" };
  }

  const rateLimitError = await enforceRateLimit(
    session.user.email as string,
    "changePassword",
  );
  if (rateLimitError) return rateLimitError;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const isPasswordValid = await argon2.verify(
    user.passwordHash,
    currentPassword,
  );
  if (!isPasswordValid) {
    return { success: false, message: "Invalid password" };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return { success: true, message: "Password changed successfully" };
}
