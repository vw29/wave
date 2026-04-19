"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, GraduationCap, Briefcase, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { followUser } from "@/actions/social/followUser";
import { unfollowUser } from "@/actions/social/unfollowUser";
import { blockUser } from "@/actions/social/blockUser";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/settings/ConfirmModal";
import { formatCount } from "@/lib/utils";
import toast from "react-hot-toast";

interface ProfileHeaderProps {
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
  isOwner: boolean;
  initialIsFollowing: boolean;
  onEditProfile: () => void;
  currentUserId?: string | null;
}

export default function ProfileHeader({
  user,
  isOwner,
  initialIsFollowing,
  onEditProfile,
  currentUserId,
}: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const displayName = user.name || user.username;
  const router = useRouter();

  function handleFollowToggle() {
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    startTransition(async () => {
      const result = wasFollowing
        ? await unfollowUser(user.id)
        : await followUser(user.id);

      if ("error" in result && result.error) {
        setIsFollowing(wasFollowing);
        toast.error(result.error);
      }
    });
  }

  async function handleBlock() {
    startTransition(async () => {
      const result = await blockUser(user.id);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Blocked @${user.username}`);
        router.push("/");
      }
    });
  }

  return (
    <header>
      {/* Top Row: Avatar + Action Button */}
      <div className="flex items-start justify-between">
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-border bg-muted">
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold text-foreground"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {isOwner ? (
          <Button variant="outline" onClick={onEditProfile}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFollowToggle}
              disabled={isPending}
              variant={isFollowing ? "outline" : "default"}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            {currentUserId && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-border bg-card shadow-2xl shadow-black/30 py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowBlockConfirm(true);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Block @{user.username}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Block confirmation modal */}
        <ConfirmModal
          open={showBlockConfirm}
          title={`Block @${user.username}?`}
          description={`They won't be able to see your profile or posts, and you won't see theirs. They won't be notified.`}
          safeActionLabel="Cancel"
          dangerActionLabel="Block"
          onSafeAction={() => {}}
          onDangerAction={handleBlock}
          onClose={() => setShowBlockConfirm(false)}
        />
      </div>

      {/* Name + Handle */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          {user.bio}
        </p>
      )}

      {/* Meta chips */}
      {(user.city || user.school || user.workplace || user.website) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {user.city && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {user.city}
            </span>
          )}
          {user.school && (
            <span className="flex items-center gap-1.5">
              <GraduationCap size={14} />
              {user.school}
            </span>
          )}
          {user.workplace && (
            <span className="flex items-center gap-1.5">
              <Briefcase size={14} />
              {user.workplace}
            </span>
          )}
          {user.website && (
            <a
              href={
                user.website.startsWith("http")
                  ? user.website
                  : `https://${user.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300"
            >
              <LinkIcon size={14} />
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-5 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-foreground">
            {formatCount(user._count.following)}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Following
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-foreground">
            {formatCount(user._count.followers)}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Followers
          </span>
        </div>
      </div>
    </header>
  );
}
