"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function followUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to follow users." };
  }

  if (session.user.id === targetUserId) {
    return { error: "You cannot follow yourself." };
  }

  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: session.user.id },
      ],
    },
  });
  if (block) {
    return { error: "Unable to follow this user." };
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existing) {
    return { success: true };
  }

  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
  });

  revalidatePath("/");
  return { success: true };
}
