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
    await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
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
