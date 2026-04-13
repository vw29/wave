"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createComment(postId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to comment." };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Comment cannot be empty." };
  }
  if (trimmed.length > 300) {
    return { error: "Comment must be 300 characters or less." };
  }

  const comment = await prisma.comment.create({
    data: {
      text: trimmed,
      authorId: session.user.id,
      postId,
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });

  revalidatePath("/");
  return {
    success: true,
    comment: {
      ...comment,
      likeCount: 0,
      likedByMe: false,
    },
  };
}
