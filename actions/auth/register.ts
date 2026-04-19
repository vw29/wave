"use server";

import { registerSchema, RegisterSchema } from "@/lib/schemas";
import { validateInput } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/ratelimit";
import prisma from "@/lib/prisma";
import { sendVerificationCode } from "./sendVerificationCode";

/**
 * Step 1: Validate registration data and send verification code.
 * Does NOT create the user yet — that happens after email verification.
 */
export async function registerUser(data: RegisterSchema) {
  const validated = validateInput(registerSchema, data);
  if (!validated.success) return validated;

  const rateLimitError = await enforceRateLimit(data.email, "register");
  if (rateLimitError) return rateLimitError;

  // Check for existing email and username before proceeding
  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: data.email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username: data.username }, select: { id: true } }),
  ]);

  if (existingUsername) {
    return { success: false as const, message: "This username is already taken" };
  }
  if (existingEmail) {
    return { success: false as const, message: "An account with this email already exists" };
  }

  // Send verification code to the email
  try {
    await sendVerificationCode(data.email, data.username);
  } catch (err) {
    console.error("[register] Failed to send verification email:", err);
    return { success: false as const, message: "Failed to send verification email. Please try again." };
  }

  return { success: true as const, email: data.email };
}
