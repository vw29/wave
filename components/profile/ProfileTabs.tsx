"use client";

type TabId = "posts" | "likes" | "saved";

interface ProfileTabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  showSaved?: boolean;
}

export default function ProfileTabs({ active, onChange, showSaved = false }: ProfileTabsProps) {
  const tabs: { id: TabId; label: string }[] = showSaved
    ? [
        { id: "posts", label: "POSTS" },
        { id: "likes", label: "LIKES" },
        { id: "saved", label: "SAVED" },
      ]
    : [
        { id: "posts", label: "POSTS" },
        { id: "likes", label: "LIKES" },
      ];

  return (
    <div className={`mt-6 grid border-b border-border ${showSaved ? "grid-cols-3" : "grid-cols-2"}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative py-3 text-sm font-semibold tracking-widest transition
            ${active === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}`}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
