"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function pinComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { postId: true, isPinned: true, post: { select: { authorId: true } } },
  });

  if (!comment) {
    return { error: "Comment not found." };
  }

  if (comment.post.authorId !== session.user.id) {
    return { error: "Only the post owner can pin comments." };
  }

  if (comment.isPinned) {
    // Unpin
    await prisma.comment.update({
      where: { id: commentId },
      data: { isPinned: false },
    });
  } else {
    // Unpin any existing pinned comment on this post, then pin this one
    await prisma.$transaction([
      prisma.comment.updateMany({
        where: { postId: comment.postId, isPinned: true },
        data: { isPinned: false },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { isPinned: true },
      }),
    ]);
  }

  revalidatePath("/");
  revalidatePath(`/post/${comment.postId}`);
  return { success: true };
}
