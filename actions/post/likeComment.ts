"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function likeComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to like a comment." };
  }

  // Get the postId for revalidation
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { postId: true },
  });

  const existing = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId: session.user.id,
        commentId,
      },
    },
  });

  if (existing) {
    await prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });
  } else {
    const commentLike = await prisma.commentLike.create({
      data: {
        userId: session.user.id,
        commentId,
      },
      select: {
        comment: {
          select: { authorId: true, postId: true },
        },
      },
    });

    // Notify the comment author (not yourself)
    if (commentLike.comment.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          senderId: session.user.id,
          receiverId: commentLike.comment.authorId,
          postId: commentLike.comment.postId,
          commentId,
        },
      });
    }
  }

  revalidatePath("/");
  if (comment) revalidatePath(`/post/${comment.postId}`);
  return { success: true };
}
