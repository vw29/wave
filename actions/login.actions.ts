"use server";

import { signIn } from "@/auth";
import { loginSchema, LoginSchema } from "@/lib/schemas";
import { AuthError } from "next-auth";

export async function loginUser(data: LoginSchema) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Something went wrong",
    };
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
