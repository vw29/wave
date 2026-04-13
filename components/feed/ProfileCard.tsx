import prisma from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

interface ProfileCardProps {
  userId: string;
}

function formatCount(num: number) {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
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
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return null;

  const displayName = user.name || user.username;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl shadow-black/20">
      {/* Banner */}


      <div className="px-5 pb-5 pt-5">
        {/* Avatar */}
        <div className="mb-3">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={displayName}
              className="w-20 h-20 rounded-2xl border-4 border-card object-cover shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 border-4 border-card flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
        <p className="text-muted-foreground text-sm">@{user.username}</p>

        {user.bio && (
          <p className="text-foreground/80 text-sm mt-3 leading-relaxed">
            {user.bio}
          </p>
        )}

        <div className="mt-3 space-y-1.5">
          {user.website && (
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-muted-foreground flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <a
                href={
                  user.website.startsWith("http")
                    ? user.website
                    : `https://${user.website}`
                }
                className="text-blue-400 hover:underline truncate"
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.website}
              </a>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-5 mt-4 pt-4 border-t border-border">
          <div>
            <span className="text-foreground font-bold text-sm">
              {formatCount(user._count.followers)}
            </span>
            <span className="text-muted-foreground text-xs ml-1">
              Followers
            </span>
          </div>
          <div>
            <span className="text-foreground font-bold text-sm">
              {formatCount(user._count.following)}
            </span>
            <span className="text-muted-foreground text-xs ml-1">
              Following
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
