"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { followUser } from "@/actions/social/followUser";
import { unfollowUser } from "@/actions/social/unfollowUser";
import type { Suggestion } from "@/actions/social/getSuggestions";
import AvatarDisplay from "@/components/ui/avatar-display";

interface WhoToFollowProps {
  suggestions: Suggestion[];
}

export default function WhoToFollow({ suggestions }: WhoToFollowProps) {
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  if (suggestions.length === 0) return null;

  const handleFollow = (userId: string) => {
    const isFollowed = followed.has(userId);
    setFollowed((prev) => {
      const next = new Set(prev);
      if (isFollowed) next.delete(userId);
      else next.add(userId);
      return next;
    });
    startTransition(async () => {
      const result = isFollowed ? await unfollowUser(userId) : await followUser(userId);
      if ("error" in result) {
        setFollowed((prev) => {
          const next = new Set(prev);
          if (isFollowed) next.add(userId);
          else next.delete(userId);
          return next;
        });
      }
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
        <Users size={20} className="text-muted-foreground" />
        People you may know
      </h3>
      <div className="space-y-3">
        {suggestions.map((s) => {
          const displayName = s.name || s.username;
          const isFollowed = followed.has(s.id);
          return (
            <div key={s.id} className="flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-muted transition-colors">
              <Link href={`/profile/${s.username}`} className="flex items-center gap-3 min-w-0">
                <AvatarDisplay name={displayName} image={s.profileImage} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate hover:underline">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{s.username}</p>
                  {s.reasons.length > 0 && (
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{s.reasons[0]}</p>
                  )}
                </div>
              </Link>
              <button
                onClick={() => handleFollow(s.id)}
                disabled={isPending}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex-shrink-0 ml-3 ${
                  isFollowed
                    ? "bg-transparent border border-border text-muted-foreground hover:border-red-500/50 hover:text-red-400"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
