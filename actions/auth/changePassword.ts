"use server";

import { auth } from "@/auth";
import { ChangePasswordSchema, changePasswordSchema } from "@/lib/schemas";
import argon2 from "argon2";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

export async function changePassword(data: ChangePasswordSchema) {
  const result = changePasswordSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      message: "Invalid data",
    };
  }

  const { currentPassword, newPassword } = result.data;

  const session = await auth();

  if (!session) {
    return {
      success: false,
      message: "You are not logged in",
    };
  }

  try {
    await checkRateLimit(session?.user?.email as string, "changePassword");
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return { success: false, message: "Too many requests" };
    }
    throw error;
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
    select: {
      passwordHash: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const isPasswordValid = await argon2.verify(
    user.passwordHash,
    currentPassword,
  );

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid password",
    };
  }

  const hashedNewPassword = await argon2.hash(newPassword);

  try {
    await prisma.user.update({
      where: { id: session?.user?.id },
      data: { passwordHash: hashedNewPassword },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to change password",
    };
  }
}
