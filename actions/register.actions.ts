"use server";

import { registerSchema, RegisterSchema } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import argon2 from "argon2";

export async function registerUser(data: RegisterSchema) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return {
      error: true,
      message: result.error.issues[0]?.message ?? "Something went wrong",
    };
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
      return { error: true, message: "Email already exists" };
    }
    return { error: true, message: "Something went wrong" };
  }
}

//  Password for [jhon.doe@example.com] is [=timqMV]^4m7U9z]
