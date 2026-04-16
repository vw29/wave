"use client";

import { useState, useTransition } from "react";
import { followUser } from "@/actions/social/followUser";
import { unfollowUser } from "@/actions/social/unfollowUser";
import type { Suggestion } from "@/actions/social/getSuggestions";

interface WhoToFollowProps {
  suggestions: Suggestion[];
}

const GRADIENTS = [
  "from-orange-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-red-600",
];

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
      const result = isFollowed
        ? await unfollowUser(userId)
        : await followUser(userId);
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
        <svg
          className="w-5 h-5 text-violet-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        People you may know
      </h3>

      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const displayName = s.name || s.username;
          const isFollowed = followed.has(s.id);
          return (
            <div
              key={s.id}
              className="flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {s.profileImage ? (
                  <img
                    src={s.profileImage}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{s.username}
                  </p>
                  {s.reasons.length > 0 && (
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                      {s.reasons[0]}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleFollow(s.id)}
                disabled={isPending}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex-shrink-0 ml-3 ${
                  isFollowed
                    ? "bg-transparent border border-border text-muted-foreground hover:border-red-500/50 hover:text-red-400"
                    : "bg-white hover:bg-gray-100 text-gray-900"
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
