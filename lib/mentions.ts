import prisma from "@/lib/prisma";

/**
 * Extract @username mentions from text, resolve to user IDs,
 * and create MENTION notifications.
 */
export async function processMentions(
  text: string,
  senderId: string,
  postId: string,
  commentId?: string,
) {
  const mentionPattern = /@([a-zA-Z0-9_]{3,20})\b/g;
  const usernames = new Set<string>();
  let match;
  while ((match = mentionPattern.exec(text)) !== null) {
    usernames.add(match[1].toLowerCase());
  }

  if (usernames.size === 0) return;

  const users = await prisma.user.findMany({
    where: { username: { in: [...usernames] } },
    select: { id: true },
  });

  const notifications = users
    .filter((u) => u.id !== senderId)
    .map((u) => ({
      type: "MENTION" as const,
      senderId,
      receiverId: u.id,
      postId,
      commentId: commentId ?? null,
    }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }
}
