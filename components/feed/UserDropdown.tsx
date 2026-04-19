"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";
import { logoutUser } from "@/actions/auth/logout";

interface UserDropdownProps {
  displayName: string;
  initial: string;
  profileHref: string;
  profileImage?: string | null;
}

export default function UserDropdown({ displayName, initial, profileHref, profileImage }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition overflow-hidden ${open ? "border-border bg-accent text-foreground" : "border-border bg-muted text-foreground hover:bg-accent"}`}
      >
        {profileImage ? (
          <img src={profileImage} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      <div
        role="menu"
        aria-label="User menu"
        className={`absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 origin-top-right rounded-xl border border-border bg-card shadow-2xl shadow-black/30 transition-all duration-150 ease-out ${open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
      >
        <div className="border-b border-border px-4 pb-3 pt-4">
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
        </div>
        <div className="py-1.5">
          <MenuItem icon={<User size={16} />} label="Profile" onClick={() => { setOpen(false); router.push(profileHref); }} />
          <MenuItem icon={<Settings size={16} />} label="Settings" onClick={() => { setOpen(false); router.push("/settings"); }} />
        </div>
        <div className="mx-3 border-t border-border" />
        <div className="py-1.5">
          <MenuItem icon={<LogOut size={16} />} label="Logout" danger onClick={() => { setOpen(false); logoutUser(); }} />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${danger ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
      <span className={danger ? "text-destructive" : "text-muted-foreground"}>{icon}</span>
      {label}
    </button>
  );
}
