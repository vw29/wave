import Link from "next/link";

export default function AuthCTA() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl shadow-black/20">

      <div className="px-5 pb-6 pt-5 relative">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-lg">
            <span className="text-lg font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              W
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Wave
            </span>
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            Join the conversation
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full text-center bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="block w-full text-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
