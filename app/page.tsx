import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getSuggestions } from "@/actions/social/getSuggestions";
import Navbar from "@/components/feed/Navbar";
import PostCard from "@/components/feed/PostCard";
import PostComposer from "@/components/feed/PostComposer";
import ProfileCard from "@/components/feed/ProfileCard";
import AuthCTA from "@/components/feed/AuthCTA";
import TrendingSection from "@/components/feed/TrendingSection";
import WhoToFollow from "@/components/feed/WhoToFollow";

export default async function Home() {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  // Get blocked user IDs (both directions) to filter from feed
  let blockedUserIds: string[] = [];
  if (currentUserId) {
    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: currentUserId },
          { blockedId: currentUserId },
        ],
      },
      select: { blockerId: true, blockedId: true },
    });
    const blockedSet = new Set<string>();
    for (const b of blocks as { blockerId: string; blockedId: string }[]) {
      if (b.blockerId !== currentUserId) blockedSet.add(b.blockerId);
      if (b.blockedId !== currentUserId) blockedSet.add(b.blockedId);
    }
    blockedUserIds = [...blockedSet];
  }

  // Fetch posts with author info and counts (excluding blocked users)
  const posts = await prisma.post.findMany({
    where: blockedUserIds.length > 0
      ? { authorId: { notIn: blockedUserIds } }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  // If logged in, get which posts the user has liked and bookmarked
  let likedPostIds = new Set<string>();
  let bookmarkedPostIds = new Set<string>();
  if (currentUserId) {
    const [likes, bookmarks] = await Promise.all([
      prisma.like.findMany({
        where: { userId: currentUserId },
        select: { postId: true },
      }),
      prisma.bookmark.findMany({
        where: { userId: currentUserId },
        select: { postId: true },
      }),
    ]);
    likedPostIds = new Set(likes.map((l: { postId: string }) => l.postId));
    bookmarkedPostIds = new Set(bookmarks.map((b: { postId: string }) => b.postId));
  }

  // Get current user info for the composer
  let currentUser: { name: string; profileImage: string | null } | null = null;
  if (currentUserId) {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { name: true, username: true, profileImage: true },
    });
    if (user) {
      currentUser = {
        name: user.name || user.username,
        profileImage: user.profileImage,
      };
    }
  }

  // Get ranked "People You May Know" suggestions
  const suggestions = currentUserId ? await getSuggestions(5) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-22">
              {currentUserId ? (
                <ProfileCard userId={currentUserId} />
              ) : (
                <AuthCTA />
              )}
            </div>
          </aside>

          {/* Main Feed */}
          <section className="lg:col-span-6 space-y-5">
            {currentUser && (
              <PostComposer
                userName={currentUser.name}
                profileImage={currentUser.profileImage}
              />
            )}

            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h3 className="text-foreground font-semibold">No posts yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Be the first to share something!
                </p>
              </div>
            ) : (
              (posts as unknown as {
                id: string;
                content: string;
                image: string | null;
                createdAt: Date;
                author: { id: string; username: string; name: string | null; profileImage: string | null };
                _count: { likes: number; comments: number };
              }[]).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  currentUserName={currentUser?.name}
                  currentUserImage={currentUser?.profileImage}
                  initialLiked={likedPostIds.has(post.id)}
                  initialBookmarked={bookmarkedPostIds.has(post.id)}
                />
              ))
            )}
          </section>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-22 space-y-5">
              <TrendingSection />
              {currentUserId && <WhoToFollow suggestions={suggestions} />}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-8 border-t border-border/40">
        <p className="text-center text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} Wave. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
