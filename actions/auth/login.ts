"use server";

import { signIn } from "@/auth";
import { loginSchema, LoginSchema } from "@/lib/schemas";
import { validateInput } from "@/lib/validation";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { verify } from "otplib";

export async function loginUser(data: LoginSchema) {
  const validated = validateInput(loginSchema, data);
  if (!validated.success) return validated;

  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      passwordHash: true,
      twoFactor: {
        select: { twoFactorSecret: true, twoFactorActivated: true },
      },
    },
  });

  const passwordValid = user
    ? await argon2.verify(user.passwordHash, data.password)
    : false;

  if (!user || !passwordValid) {
    return { success: false, message: "Invalid credentials" };
  }

  if (user.twoFactor?.twoFactorActivated) {
    if (!data.twoFactorCode) {
      return { success: false, requiresTwoFactor: true, message: "" };
    }

    const result = await verify({
      token: data.twoFactorCode,
      secret: user.twoFactor.twoFactorSecret!,
    });

    if (!result.valid) {
      return { success: false, message: "Invalid authenticator code" };
    }
  }

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true, message: "Login successful" };
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { success: false, message: "Invalid credentials" };
    }
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return {
        success: false,
        message: "Too many attempts. Please try again later.",
      };
    }
    throw error;
  }
}
