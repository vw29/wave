"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function autoLogin(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true as const };
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { success: false as const, message: "Auto-login failed" };
    }
    throw error;
  }
}
