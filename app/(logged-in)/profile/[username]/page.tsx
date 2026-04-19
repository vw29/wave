import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfilePage from "@/components/profile/ProfilePage";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  // Fetch the profile user
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      profileImage: true,
      website: true,
      city: true,
      school: true,
      workplace: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return notFound();

  const isOwner = currentUserId === user.id;

  // Check block status (both directions)
  let isBlocked = false;
  let isBlockedByThem = false;
  if (currentUserId && !isOwner) {
    const [blockedByMe, blockedByThem] = await Promise.all([
      prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: currentUserId, blockedId: user.id } },
      }),
      prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: user.id, blockedId: currentUserId } },
      }),
    ]);
    isBlocked = !!blockedByMe;
    isBlockedByThem = !!blockedByThem;
  }

  // If blocked in either direction, return minimal data
  if (isBlocked || isBlockedByThem) {
    return (
      <ProfilePage
        user={user}
        posts={[]}
        likedPosts={[]}
        savedPosts={[]}
        likedPostIds={[]}
        likedPostIdsInLikedTab={[]}
        likedPostIdsInSavedTab={[]}
        bookmarkedPostIds={[]}
        currentUserId={currentUserId}
        isOwner={false}
        initialIsFollowing={false}
        isBlocked={isBlocked}
        isBlockedByThem={isBlockedByThem}
      />
    );
  }

  const postInclude = {
    author: {
      select: { id: true, username: true, name: true, profileImage: true },
    },
    _count: { select: { likes: true, comments: true } },
  };

  // Fetch data in parallel
  const [userPosts, likedPosts, savedPosts, followRecord, currentUserProfile] =
    await Promise.all([
      // User's own posts
      prisma.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: postInclude,
      }),

      // Posts the user has liked
      prisma.like.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { post: { include: postInclude } },
      }),

      // Saved/bookmarked posts (owner only)
      isOwner
        ? prisma.bookmark.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
            select: { post: { include: postInclude } },
          })
        : [],

      // Check if current user follows this profile
      currentUserId && !isOwner
        ? prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: user.id,
              },
            },
          })
        : null,

      // Current user's profile for PostCard
      currentUserId
        ? prisma.user.findUnique({
            where: { id: currentUserId },
            select: { name: true, profileImage: true },
          })
        : null,
    ]);

  const likedPostsList = likedPosts.map((l) => l.post);
  const savedPostsList = Array.isArray(savedPosts)
    ? savedPosts.map((b) => b.post)
    : [];

  // Collect all post IDs across tabs
  const allPostIds = userPosts.map((p) => p.id);
  const allLikedTabPostIds = likedPostsList.map((p) => p.id);
  const allSavedTabPostIds = savedPostsList.map((p) => p.id);
  const allRelevantPostIds = [
    ...allPostIds,
    ...allLikedTabPostIds,
    ...allSavedTabPostIds,
  ];

  // Fetch current user's likes and bookmarks across all displayed posts
  let currentUserLikedPostIds: string[] = [];
  let currentUserBookmarkedPostIds: string[] = [];
  if (currentUserId && allRelevantPostIds.length > 0) {
    const [likes, bookmarks] = await Promise.all([
      prisma.like.findMany({
        where: { userId: currentUserId, postId: { in: allRelevantPostIds } },
        select: { postId: true },
      }),
      prisma.bookmark.findMany({
        where: { userId: currentUserId, postId: { in: allRelevantPostIds } },
        select: { postId: true },
      }),
    ]);
    currentUserLikedPostIds = likes.map((l) => l.postId);
    currentUserBookmarkedPostIds = bookmarks.map((b) => b.postId);
  }

  const likedSet = new Set(currentUserLikedPostIds);
  const likedPostIds = allPostIds.filter((id) => likedSet.has(id));
  const likedPostIdsInLikedTab = allLikedTabPostIds.filter((id) =>
    likedSet.has(id)
  );
  const likedPostIdsInSavedTab = allSavedTabPostIds.filter((id) =>
    likedSet.has(id)
  );

  return (
    <ProfilePage
      user={user}
      posts={userPosts}
      likedPosts={likedPostsList}
      savedPosts={savedPostsList}
      likedPostIds={likedPostIds}
      likedPostIdsInLikedTab={likedPostIdsInLikedTab}
      likedPostIdsInSavedTab={likedPostIdsInSavedTab}
      bookmarkedPostIds={currentUserBookmarkedPostIds}
      currentUserId={currentUserId}
      currentUserName={currentUserProfile?.name}
      currentUserImage={currentUserProfile?.profileImage}
      isOwner={isOwner}
      initialIsFollowing={!!followRecord}
      isBlocked={false}
      isBlockedByThem={false}
    />
  );
}
