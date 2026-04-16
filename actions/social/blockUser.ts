"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function blockUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  if (session.user.id === targetUserId) {
    return { error: "You cannot block yourself." };
  }

  await prisma.$transaction([
    prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: targetUserId,
        },
      },
      create: {
        blockerId: session.user.id,
        blockedId: targetUserId,
      },
      update: {},
    }),
    prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: session.user.id, followingId: targetUserId },
          { followerId: targetUserId, followingId: session.user.id },
        ],
      },
    }),
  ]);

  revalidatePath("/");
  return { success: true };
}
