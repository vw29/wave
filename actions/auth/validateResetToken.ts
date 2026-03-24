"use server";

import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function validateResetToken(token: string) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const databaseToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!databaseToken) {
    return { valid: false, reason: "invalid" as const };
  }

  if (databaseToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: databaseToken.id },
    });
    return { valid: false, reason: "expired" as const };
  }

  return { valid: true };
}
