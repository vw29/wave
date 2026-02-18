"use server";

import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginSchema } from "@/lib/schemas";
import argon2 from "argon2";

export async function loginUser(data: LoginSchema) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Something went wrong",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });
    if (!user) {
      return { success: false, message: "Email or password is incorrect" };
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
      },
    };
  } catch (error) {
    console.log("Login error", error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
