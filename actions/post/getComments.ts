"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getComments(postId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    take: 50,
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
      _count: {
        select: { likes: true },
      },
      likes: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { userId: true },
            take: 1,
          }
        : false,
    },
  });

  return comments.map((c) => ({
    id: c.id,
    text: c.text,
    createdAt: c.createdAt,
    author: c.author,
    likeCount: c._count.likes,
    likedByMe:
      "likes" in c && Array.isArray(c.likes) ? c.likes.length > 0 : false,
  }));
}
