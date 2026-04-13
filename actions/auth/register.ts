"use server";

import { registerSchema, RegisterSchema } from "@/lib/schemas";
import { validateInput } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/ratelimit";
import { hashPassword } from "@/lib/password";
import prisma from "@/lib/prisma";

export async function registerUser(data: RegisterSchema) {
  const validated = validateInput(registerSchema, data);
  if (!validated.success) return validated;

  const rateLimitError = await enforceRateLimit(data.email, "register");
  if (rateLimitError) return rateLimitError;

  const passwordHash = await hashPassword(data.password);

  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        username: data.username,
      },
    });

    return { success: true as const, email: user.email };
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { target?: string[] } };
    if (err?.code === "P2002") {
      const target = err.meta?.target;
      if (target?.includes("username")) {
        return { success: false as const, message: "This username is already taken" };
      }
      return { success: false as const, message: "Email already exists" };
    }
    return { success: false as const, message: "Something went wrong" };
  }
}
