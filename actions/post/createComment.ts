"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { processMentions } from "@/lib/mentions";

export async function createComment(postId: string, text: string, parentId?: string) {
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
      parentId: parentId || null,
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      post: { select: { authorId: true } },
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

  // Notify the post author (not yourself)
  if (comment.post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: "COMMENT",
        senderId: session.user.id,
        receiverId: comment.post.authorId,
        postId,
        commentId: comment.id,
      },
    });
  }

  // Notify the parent comment author if replying (and not yourself, and not already notified as post author)
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });
    if (
      parentComment &&
      parentComment.authorId !== session.user.id &&
      parentComment.authorId !== comment.post.authorId
    ) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          senderId: session.user.id,
          receiverId: parentComment.authorId,
          postId,
          commentId: comment.id,
        },
      });
    }
  }

  await processMentions(trimmed, session.user.id, postId, comment.id);

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  const { post: _unusedPost, ...commentData } = comment;
  return {
    success: true,
    comment: {
      ...commentData,
      parentId: parentId || null,
      isPinned: false,
      likeCount: 0,
      likedByMe: false,
      replies: [] as MappedComment[],
    },
  };
}

interface MappedComment {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  isPinned: boolean;
  author: {
    id: string;
    username: string;
    name: string | null;
    profileImage: string | null;
  };
  likeCount: number;
  likedByMe: boolean;
  replies: MappedComment[];
}
