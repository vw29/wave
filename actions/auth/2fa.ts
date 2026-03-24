"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateSecret, generateURI, verify } from "otplib";

export async function generateTwoFactorSecret() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const user = await prisma.twoFactor.findUnique({
    where: { userId: session.user.id },
    select: { twoFactorSecret: true, twoFactorActivated: true },
  });

  if (user?.twoFactorActivated) {
    return {
      success: false,
      error: "Two factor authentication is already enabled",
    };
  }

  let secret = user?.twoFactorSecret;

  if (!secret) {
    secret = generateSecret();
    await prisma.twoFactor.upsert({
      where: { userId: session.user.id },
      update: { twoFactorSecret: secret },
      create: { twoFactorSecret: secret, userId: session.user.id },
    });
  }
  // session.user.email, "Wave", secret
  return {
    success: true,
    secret: generateURI({
      issuer: "Wave",
      label: session.user.email ?? "Wave User",
      secret,
    }),
  };
}

export async function verifyTwoFactorCode(token: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const user = await prisma.twoFactor.findUnique({
    where: { userId: session.user.id },
    select: { twoFactorSecret: true, twoFactorActivated: true },
  });

  if (!user?.twoFactorSecret) {
    return {
      success: false,
      error: "Two factor authentication is not enabled",
    };
  }

  const result = await verify({ token, secret: user.twoFactorSecret });

  console.log(result);

  if (!result.valid) {
    return {
      success: false,
      error: "Invalid two factor code",
    };
  }

  await prisma.twoFactor.update({
    where: { userId: session.user.id },
    data: { twoFactorActivated: true },
  });

  return {
    success: true,
    message: "Two factor authentication enabled successfully",
  };
}

export async function disableTwoFactor() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const user = await prisma.twoFactor.findUnique({
    where: { userId: session.user.id },
    select: { twoFactorSecret: true, twoFactorActivated: true },
  });

  if (!user?.twoFactorActivated) {
    return {
      success: false,
      error: "Two factor authentication is not enabled",
    };
  }

  await prisma.twoFactor.update({
    where: { userId: session.user.id },
    data: { twoFactorActivated: false },
  });

  return {
    success: true,
    message: "Two factor authentication disabled successfully",
  };
}
