"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const notifications = await prisma.notification.findMany({
    where: { receiverId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      type: true,
      read: true,
      createdAt: true,
      postId: true,
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
      comment: {
        select: {
          text: true,
        },
      },
    },
  });

  return notifications;
}

export type NotificationData = Awaited<
  ReturnType<typeof getNotifications>
>[number];
