import prisma from "@/lib/prisma";
import { Link2 } from "lucide-react";
import { formatCount } from "@/lib/utils";

interface ProfileCardProps {
  userId: string;
}

export default async function ProfileCard({ userId }: ProfileCardProps) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      username: true,
      email: true,
      bio: true,
      website: true,
      profileImage: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!user) return null;

  const displayName = user.name || user.username;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl shadow-black/20">
      <div className="px-5 pb-5 pt-5">
        <div className="mb-3">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={displayName}
              className="w-20 h-20 rounded-2xl border-4 border-card object-cover shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-muted border-4 border-card flex items-center justify-center text-2xl font-bold text-foreground shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
        <p className="text-muted-foreground text-sm">@{user.username}</p>

        {user.bio && (
          <p className="text-foreground/80 text-sm mt-3 leading-relaxed">{user.bio}</p>
        )}

        {user.website && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Link2 size={16} className="text-muted-foreground flex-shrink-0" />
            <a
              href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
              className="text-blue-400 hover:underline truncate"
              target="_blank"
              rel="noopener noreferrer"
            >
              {user.website}
            </a>
          </div>
        )}

        <div className="flex gap-5 mt-4 pt-4 border-t border-border">
          <div>
            <span className="text-foreground font-bold text-sm">{formatCount(user._count.followers)}</span>
            <span className="text-muted-foreground text-xs ml-1">Followers</span>
          </div>
          <div>
            <span className="text-foreground font-bold text-sm">{formatCount(user._count.following)}</span>
            <span className="text-muted-foreground text-xs ml-1">Following</span>
          </div>
        </div>
      </div>
    </div>
  );
}
