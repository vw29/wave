import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import PostCard from "@/components/feed/PostCard";
import { Search } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}



interface SearchUser {
  id: string;
  username: string;
  name: string | null;
  profileImage: string | null;
  bio: string | null;
  _count: { followers: number };
}

interface SearchPost {
  id: string;
  content: string;
  image: string | null;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    name: string | null;
    profileImage: string | null;
  };
  _count: { likes: number; comments: number };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  if (!query) {
    return (
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 mb-5 rounded-2xl bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-foreground font-semibold text-lg">Search Wave</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Type something in the search bar to find people and posts.
          </p>
        </div>
      </div>
    );
  }

  // Parallel fetch users + posts + current user info
  const [users, posts, currentUserProfile] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        profileImage: true,
        bio: true,
        _count: { select: { followers: true } },
      },
      take: 5,
    }) as Promise<SearchUser[]>,
    prisma.post.findMany({
      where: {
        content: { contains: query, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: {
          select: { id: true, username: true, name: true, profileImage: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    }) as Promise<SearchPost[]>,
    currentUserId
      ? prisma.user.findUnique({
          where: { id: currentUserId },
          select: { name: true, profileImage: true },
        })
      : null,
  ]);

  // Get liked/bookmarked post IDs for the current user
  let likedPostIds = new Set<string>();
  let bookmarkedPostIds = new Set<string>();
  if (currentUserId && posts.length > 0) {
    const ids = posts.map((p) => p.id);
    const [likes, bookmarks] = await Promise.all([
      prisma.like.findMany({
        where: { userId: currentUserId, postId: { in: ids } },
        select: { postId: true },
      }),
      prisma.bookmark.findMany({
        where: { userId: currentUserId, postId: { in: ids } },
        select: { postId: true },
      }),
    ]);
    likedPostIds = new Set(likes.map((l: { postId: string }) => l.postId));
    bookmarkedPostIds = new Set(bookmarks.map((b: { postId: string }) => b.postId));
  }

  const hasResults = users.length > 0 || posts.length > 0;

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Search size={14} />
        <span>
          Results for{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{query}&rdquo;
          </span>
        </span>
      </div>

      {!hasResults && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 mb-5 rounded-2xl bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-foreground font-semibold text-lg">
            No results found
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Try different keywords or check your spelling.
          </p>
        </div>
      )}

      {/* People */}
      {users.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            People
          </h2>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {users.map((user) => {
              const displayName = user.name || user.username;
              return (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                >
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground flex-shrink-0"
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                      {user._count.followers > 0 &&
                        ` · ${user._count.followers} follower${user._count.followers !== 1 ? "s" : ""}`}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Posts
          </h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                currentUserName={currentUserProfile?.name}
                currentUserImage={currentUserProfile?.profileImage}
                initialLiked={likedPostIds.has(post.id)}
                initialBookmarked={bookmarkedPostIds.has(post.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
