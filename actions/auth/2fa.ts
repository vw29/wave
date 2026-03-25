"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateSecret, generateURI, verify } from "otplib";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      userId: null as never,
      email: null as never,
      error: { success: false as const, message: "Unauthorized" },
    };
  }
  return { userId: session.user.id, email: session.user.email ?? "", error: null };
}

async function getTwoFactorRecord(userId: string) {
  return prisma.twoFactor.findUnique({
    where: { userId },
    select: { twoFactorSecret: true, twoFactorActivated: true },
  });
}

export async function generateTwoFactorSecret() {
  const { userId, email, error } = await requireAuth();
  if (error) return error;

  const record = await getTwoFactorRecord(userId);

  if (record?.twoFactorActivated) {
    return {
      success: false,
      message: "Two-factor authentication is already enabled",
    };
  }

  let secret = record?.twoFactorSecret;

  if (!secret) {
    secret = generateSecret();
    await prisma.twoFactor.upsert({
      where: { userId },
      update: { twoFactorSecret: secret },
      create: { twoFactorSecret: secret, userId },
    });
  }

  return {
    success: true,
    secret: generateURI({
      issuer: "Wave",
      label: email || "Wave User",
      secret,
    }),
  };
}

export async function verifyTwoFactorCode(token: string) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const record = await getTwoFactorRecord(userId);

  if (!record?.twoFactorSecret) {
    return {
      success: false,
      message: "Two-factor authentication is not set up",
    };
  }

  const result = await verify({ token, secret: record.twoFactorSecret });

  if (!result.valid) {
    return { success: false, message: "Invalid authenticator code" };
  }

  await prisma.twoFactor.update({
    where: { userId },
    data: { twoFactorActivated: true },
  });

  return {
    success: true,
    message: "Two-factor authentication enabled successfully",
  };
}

export async function disableTwoFactor() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const record = await getTwoFactorRecord(userId);

  if (!record?.twoFactorActivated) {
    return {
      success: false,
      message: "Two-factor authentication is not enabled",
    };
  }

  await prisma.twoFactor.update({
    where: { userId },
    data: { twoFactorActivated: false },
  });

  return {
    success: true,
    message: "Two-factor authentication disabled successfully",
  };
}
