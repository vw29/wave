"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldOff } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { Button } from "@/components/ui/button";
import { unblockUser } from "@/actions/social/unblockUser";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import EditProfileModal from "./EditProfileModal";
import toast from "react-hot-toast";

interface PostData {
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
  _count: {
    likes: number;
    comments: number;
  };
}

interface ProfilePageProps {
  user: {
    id: string;
    username: string;
    name: string | null;
    bio: string | null;
    profileImage: string | null;
    website: string | null;
    city: string | null;
    school: string | null;
    workplace: string | null;
    _count: {
      followers: number;
      following: number;
    };
  };
  posts: PostData[];
  likedPosts: PostData[];
  savedPosts: PostData[];
  likedPostIds: string[];
  likedPostIdsInLikedTab: string[];
  likedPostIdsInSavedTab: string[];
  bookmarkedPostIds: string[];
  currentUserId: string | null;
  currentUserName?: string | null;
  currentUserImage?: string | null;
  isOwner: boolean;
  initialIsFollowing: boolean;
  isBlocked?: boolean;
  isBlockedByThem?: boolean;
}

export default function ProfilePage({
  user,
  posts,
  likedPosts,
  savedPosts,
  likedPostIds,
  likedPostIdsInLikedTab,
  likedPostIdsInSavedTab,
  bookmarkedPostIds,
  currentUserId,
  currentUserName,
  currentUserImage,
  isOwner,
  initialIsFollowing,
  isBlocked = false,
  isBlockedByThem = false,
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "likes" | "saved">("posts");
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const activePosts =
    activeTab === "posts" ? posts : activeTab === "likes" ? likedPosts : savedPosts;
  const activeLikedIds =
    activeTab === "posts"
      ? likedPostIds
      : activeTab === "likes"
        ? likedPostIdsInLikedTab
        : likedPostIdsInSavedTab;
  const likedSet = new Set(activeLikedIds);
  const bookmarkedSet = new Set(bookmarkedPostIds);

  function handleModalClose() {
    setModalOpen(false);
    router.refresh();
  }

  const [isUnblocking, startUnblock] = useTransition();

  function handleUnblock() {
    startUnblock(async () => {
      const result = await unblockUser(user.id);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  // Blocked state
  if (isBlocked || isBlockedByThem) {
    return (
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <ShieldOff size={28} className="text-muted-foreground" />
          </div>
          {isBlocked ? (
            <>
              <h2 className="text-lg font-semibold text-foreground">
                You have blocked @{user.username}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                You won&apos;t see their posts or profile. You can unblock them at any time.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={handleUnblock}
                disabled={isUnblocking}
              >
                {isUnblocking ? "Unblocking..." : "Unblock"}
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-foreground">
                This content is not available
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                The profile you&apos;re looking for is currently unavailable.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <ProfileHeader
        user={user}
        isOwner={isOwner}
        initialIsFollowing={initialIsFollowing}
        onEditProfile={() => setModalOpen(true)}
        currentUserId={currentUserId}
      />

      <ProfileTabs active={activeTab} onChange={setActiveTab} showSaved={isOwner} />

      {/* Posts */}
      <div className="divide-y divide-border">
        {activePosts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {activeTab === "posts"
              ? "No posts yet."
              : activeTab === "likes"
                ? "No liked posts yet."
                : "No saved posts yet."}
          </p>
        ) : (
          activePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserImage={currentUserImage}
              initialLiked={likedSet.has(post.id)}
              initialBookmarked={bookmarkedSet.has(post.id)}
            />
          ))
        )}
      </div>

      {/* Edit Profile Modal (owner only) */}
      {isOwner && (
        <EditProfileModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          user={{
            username: user.username,
            name: user.name,
            bio: user.bio,
            profileImage: user.profileImage,
            website: user.website,
            school: user.school,
            city: user.city,
            workplace: user.workplace,
          }}
        />
      )}
    </div>
  );
}
