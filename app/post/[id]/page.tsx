import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/components/feed/Navbar";
import PostCard from "@/components/feed/PostCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, username: true, name: true, profileImage: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) return notFound();

  // Check if current user liked/bookmarked this post
  let initialLiked = false;
  let initialBookmarked = false;
  let currentUser: { name: string; profileImage: string | null } | null = null;

  if (currentUserId) {
    const [like, bookmark, user] = await Promise.all([
      prisma.like.findUnique({
        where: { userId_postId: { userId: currentUserId, postId: id } },
      }),
      prisma.bookmark.findUnique({
        where: { userId_postId: { userId: currentUserId, postId: id } },
      }),
      prisma.user.findUnique({
        where: { id: currentUserId },
        select: { name: true, username: true, profileImage: true },
      }),
    ]);
    initialLiked = !!like;
    initialBookmarked = !!bookmark;
    if (user) {
      currentUser = {
        name: user.name || user.username,
        profileImage: user.profileImage,
      };
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <PostCard
          post={post}
          currentUserId={currentUserId}
          currentUserName={currentUser?.name}
          currentUserImage={currentUser?.profileImage}
          initialLiked={initialLiked}
          initialBookmarked={initialBookmarked}
        />
      </main>
    </div>
  );
}
