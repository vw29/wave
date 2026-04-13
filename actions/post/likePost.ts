"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function likePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to like a post." };
  }

  const existing = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId,
      },
    },
  });

  if (existing) {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });
  } else {
    await prisma.like.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}
