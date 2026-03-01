"use server";

import { registerSchema, RegisterSchema } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { checkRateLimit } from "@/lib/ratelimit";

export async function registerUser(data: RegisterSchema) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Something went wrong",
    };
  }
  try {
    await checkRateLimit(data.email, "register");
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return { success: false, message: "Too many requests" };
    }
    throw error;
  }

  const hashedPassword = await argon2.hash(data.password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  try {
    await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        username: data.email.split("@")[0],
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { target?: string[] } };
    if (err?.code === "P2002") {
      return { success: false, message: "Email already exists" };
    }
    return { success: false, message: "Something went wrong" };
  }
}
