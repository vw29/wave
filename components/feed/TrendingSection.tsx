const trends = [
  { category: "Technology", tag: "#Web3Dashboard", posts: "2.5k" },
  { category: "Nature", tag: "#MountainEscapes", posts: "1.8k" },
  { category: "Design", tag: "#UXTrends2025", posts: "5.2k" },
  { category: "Science", tag: "#AIRevolution", posts: "12k" },
];

export default function TrendingSection() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        Trending for you
      </h3>

      <div className="space-y-4">
        {trends.map((trend, i) => (
          <div
            key={i}
            className="group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-muted transition-colors"
          >
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              {trend.category} · Trending
            </p>
            <p className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors mt-0.5">
              {trend.tag}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {trend.posts} posts
            </p>
          </div>
        ))}
      </div>

      <button className="text-blue-400 text-sm mt-3 hover:text-blue-300 transition-colors font-medium">
        Show more
      </button>
    </div>
  );
}
