"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const commentSelect = (currentUserId?: string) => ({
  id: true,
  text: true,
  createdAt: true,
  updatedAt: true,
  parentId: true,
  isPinned: true,
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
    : (false as const),
});

interface MappedComment {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  isPinned: boolean;
  author: { id: string; username: string; name: string | null; profileImage: string | null };
  likeCount: number;
  likedByMe: boolean;
  replies: MappedComment[];
}

interface RawComment {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  isPinned: boolean;
  author: { id: string; username: string; name: string | null; profileImage: string | null };
  _count: { likes: number };
  likes?: { userId: string }[];
  replies?: RawComment[];
}

function mapComment(c: RawComment): MappedComment {
  return {
    id: c.id,
    text: c.text,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    parentId: c.parentId,
    isPinned: c.isPinned ?? false,
    author: c.author,
    likeCount: c._count.likes,
    likedByMe:
      "likes" in c && Array.isArray(c.likes) ? c.likes.length > 0 : false,
    replies: (c.replies ?? []).map(mapComment),
  };
}

export async function getComments(postId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: [{ isPinned: "desc" }, { createdAt: "asc" }],
    take: 50,
    select: {
      ...commentSelect(currentUserId),
      replies: {
        orderBy: { createdAt: "asc" },
        take: 50,
        select: commentSelect(currentUserId),
      },
    },
  });

  return comments.map(mapComment);
}

export type CommentWithReplies = ReturnType<typeof mapComment>;
