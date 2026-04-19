"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const WEIGHTS = {
  MUTUAL_FRIEND: 10,
  SHARED_SCHOOL: 3,
  SHARED_CITY: 2,
  SHARED_WORKPLACE: 3,
} as const;

export interface Suggestion {
  id: string;
  name: string | null;
  username: string;
  profileImage: string | null;
  score: number;
  mutualFriendCount: number;
  reasons: string[];
}

const FOF_QUERY = `
WITH my_friends AS (
  SELECT f1."followingId" AS friend_id
  FROM "Follow" f1
  INNER JOIN "Follow" f2
    ON f1."followingId" = f2."followerId"
   AND f2."followingId" = f1."followerId"
  WHERE f1."followerId" = $1
),
my_following AS (
  SELECT "followingId" FROM "Follow" WHERE "followerId" = $1
),
my_blocks AS (
  SELECT "blockedId" AS user_id FROM "Block" WHERE "blockerId" = $1
  UNION
  SELECT "blockerId" AS user_id FROM "Block" WHERE "blockedId" = $1
),
candidates AS (
  SELECT
    f."followingId" AS candidate_id,
    COUNT(DISTINCT mf.friend_id) AS mutual_friend_count
  FROM my_friends mf
  INNER JOIN "Follow" f ON f."followerId" = mf.friend_id
  WHERE f."followingId" != $1
    AND f."followingId" NOT IN (SELECT "followingId" FROM my_following)
    AND f."followingId" NOT IN (SELECT user_id FROM my_blocks)
  GROUP BY f."followingId"
)
SELECT
  c.candidate_id,
  c.mutual_friend_count,
  u.name,
  u.username,
  u."profileImage",
  u.school,
  u.city,
  u.workplace
FROM candidates c
INNER JOIN "User" u ON u.id = c.candidate_id
ORDER BY c.mutual_friend_count DESC
LIMIT $2
`;

interface RawCandidate {
  candidate_id: string;
  mutual_friend_count: bigint;
  name: string | null;
  username: string;
  profileImage: string | null;
  school: string | null;
  city: string | null;
  workplace: string | null;
}

function scoreAttributes(
  currentUser: { school: string | null; city: string | null; workplace: string | null },
  candidate: { school: string | null; city: string | null; workplace: string | null },
): { bonus: number; reasons: string[] } {
  let bonus = 0;
  const reasons: string[] = [];

  if (currentUser.school && candidate.school
      && currentUser.school.toLowerCase() === candidate.school.toLowerCase()) {
    bonus += WEIGHTS.SHARED_SCHOOL;
    reasons.push(`Goes to ${candidate.school}`);
  }

  if (currentUser.city && candidate.city
      && currentUser.city.toLowerCase() === candidate.city.toLowerCase()) {
    bonus += WEIGHTS.SHARED_CITY;
    reasons.push(`Lives in ${candidate.city}`);
  }

  if (currentUser.workplace && candidate.workplace
      && currentUser.workplace.toLowerCase() === candidate.workplace.toLowerCase()) {
    bonus += WEIGHTS.SHARED_WORKPLACE;
    reasons.push(`Works at ${candidate.workplace}`);
  }

  return { bonus, reasons };
}

export async function getSuggestions(limit: number = 5): Promise<Suggestion[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const currentUserId = session.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { school: true, city: true, workplace: true },
  });
  if (!currentUser) return [];

  // Phase 1: Friends-of-friends via raw SQL
  const rawCandidates = await prisma.$queryRawUnsafe<RawCandidate[]>(
    FOF_QUERY,
    currentUserId,
    limit * 3,
  );

  const scored: Suggestion[] = rawCandidates.map((c: RawCandidate) => {
    const mutualCount = Number(c.mutual_friend_count);
    const { bonus, reasons } = scoreAttributes(currentUser, {
      school: c.school,
      city: c.city,
      workplace: c.workplace,
    });

    if (mutualCount > 0) {
      reasons.unshift(`${mutualCount} mutual friend${mutualCount > 1 ? "s" : ""}`);
    }

    return {
      id: c.candidate_id,
      name: c.name,
      username: c.username,
      profileImage: c.profileImage,
      score: mutualCount * WEIGHTS.MUTUAL_FRIEND + bonus,
      mutualFriendCount: mutualCount,
      reasons,
    };
  });

  scored.sort((a, b) => b.score - a.score || b.mutualFriendCount - a.mutualFriendCount);

  // Phase 2: Attribute-based fallback for cold-start users
  if (scored.length < limit) {
    const excludeIds = [currentUserId, ...scored.map((s: Suggestion) => s.id)];
    const remaining = limit - scored.length;

    const attrFilters = [
      ...(currentUser.school ? [{ school: currentUser.school }] : []),
      ...(currentUser.city ? [{ city: currentUser.city }] : []),
      ...(currentUser.workplace ? [{ workplace: currentUser.workplace }] : []),
    ];

    if (attrFilters.length > 0) {
      const attrUsers = await prisma.user.findMany({
        where: {
          id: { notIn: excludeIds },
          followers: { none: { followerId: currentUserId } },
          blockedByUsers: { none: { blockerId: currentUserId } },
          blockedUsers: { none: { blockedId: currentUserId } },
          OR: attrFilters,
        },
        select: {
          id: true, name: true, username: true, profileImage: true,
          school: true, city: true, workplace: true,
        },
        take: remaining,
      });

      for (const u of attrUsers) {
        const { bonus, reasons } = scoreAttributes(currentUser, u);
        scored.push({
          id: u.id,
          name: u.name,
          username: u.username,
          profileImage: u.profileImage,
          score: bonus,
          mutualFriendCount: 0,
          reasons,
        });
      }
    }
  }

  // Phase 3: Random fallback for brand-new users with no attributes
  if (scored.length < limit) {
    const excludeIds = [currentUserId, ...scored.map((s: Suggestion) => s.id)];
    const remaining = limit - scored.length;

    const randomUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        followers: { none: { followerId: currentUserId } },
        blockedByUsers: { none: { blockerId: currentUserId } },
        blockedUsers: { none: { blockedId: currentUserId } },
      },
      select: { id: true, name: true, username: true, profileImage: true },
      take: remaining,
    });

    for (const u of randomUsers) {
      scored.push({
        id: u.id,
        name: u.name,
        username: u.username,
        profileImage: u.profileImage,
        score: 0,
        mutualFriendCount: 0,
        reasons: [],
      });
    }
  }

  return scored.slice(0, limit);
}
