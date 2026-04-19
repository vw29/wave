import { auth } from "@/auth";
import Link from "next/link";
import UserDropdown from "@/components/feed/UserDropdown";
import NotificationsDropdown from "@/components/feed/NotificationsDropdown";
import SearchBar from "@/components/feed/SearchBar";
import prisma from "@/lib/prisma";
import { getNotifications } from "@/actions/notification/getNotifications";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  const dbUser = user?.id
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { username: true, name: true, profileImage: true },
      })
    : null;

  const profileHref = dbUser ? `/profile/${dbUser.username}` : "/settings";
  const displayName = dbUser?.name || dbUser?.username || user?.email || "User";

  const notifications = user?.id ? await getNotifications() : [];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight select-none">
              Wave
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="hidden sm:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationsDropdown
                  notifications={notifications}
                  currentUserId={user.id!}
                />
                <UserDropdown
                  displayName={displayName}
                  initial={user.email?.charAt(0).toUpperCase() ?? "U"}
                  profileHref={profileHref}
                  profileImage={dbUser?.profileImage}
                />
              </>
            ) : (
              <Link
                href="/login"
                className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
