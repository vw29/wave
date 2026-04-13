import { auth } from "@/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

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

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-foreground font-medium text-sm rounded-xl bg-muted transition-colors"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/my-account"
                  className="px-4 py-2 text-muted-foreground font-medium text-sm rounded-xl hover:text-foreground hover:bg-muted transition-colors"
                >
                  My Account
                </Link>
                <Link
                  href="/change-password"
                  className="px-4 py-2 text-muted-foreground font-medium text-sm rounded-xl hover:text-foreground hover:bg-muted transition-colors"
                >
                  Settings
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-background"></span>
                </div>
                <Link
                  href="/my-account"
                  className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground cursor-pointer hover:bg-accent transition-all"
                >
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </Link>
                <LogoutButton />
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
