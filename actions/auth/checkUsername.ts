"use server";

import prisma from "@/lib/prisma";

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  if (!username || username.length < 3) {
    return { available: false };
  }

  const existing = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });

  return { available: !existing };
}
