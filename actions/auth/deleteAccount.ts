"use server";

import { auth, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import argon2 from "argon2";

export async function deleteAccount(password: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "You are not logged in" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const isPasswordValid = await argon2.verify(user.passwordHash, password);
  if (!isPasswordValid) {
    return { success: false, message: "Incorrect password" };
  }

  await prisma.user.delete({
    where: { id: session.user.id },
  });

  await signOut({ redirectTo: "/login" });
}
