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
    const like = await prisma.like.create({
      data: {
        userId: session.user.id,
        postId,
      },
      select: { post: { select: { authorId: true } } },
    });

    // Notify the post author (not yourself)
    if (like.post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          senderId: session.user.id,
          receiverId: like.post.authorId,
          postId,
        },
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { success: true };
}
