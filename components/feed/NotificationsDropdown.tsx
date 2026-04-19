"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";
import { markAllRead } from "@/actions/notification/markAllRead";
import { followUser } from "@/actions/social/followUser";
import type { NotificationData } from "@/actions/notification/getNotifications";
import AvatarDisplay from "@/components/ui/avatar-display";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

interface NotificationsDropdownProps {
  notifications: NotificationData[];
  currentUserId: string;
}

type GroupKey = "LIKE" | "COMMENT" | "FOLLOW" | "MENTION";

export default function NotificationsDropdown({
  notifications: initialNotifications,
  currentUserId,
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(async () => {
      await markAllRead();
      router.refresh();
    });
  }

  function handleFollowBack(senderId: string) {
    startTransition(async () => {
      const result = await followUser(senderId);
      if ("error" in result && result.error) toast.error(result.error);
      else {
        toast.success("Followed back!");
        router.refresh();
      }
    });
  }

  const grouped = notifications.reduce<Record<GroupKey, NotificationData[]>>(
    (acc, n) => {
      (acc[n.type] ||= []).push(n);
      return acc;
    },
    {} as Record<GroupKey, NotificationData[]>,
  );

  const close = () => setOpen(false);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition ${open ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </button>

      <div
        role="dialog"
        aria-label="Notifications"
        className={`absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[380px] origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/30 transition-all duration-150 ease-out ${open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} disabled={isPending} className="text-xs font-semibold uppercase tracking-wider text-primary transition hover:text-primary/80 disabled:opacity-50">
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-[480px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">You&rsquo;re all caught up</p>
              <p className="text-xs text-muted-foreground">New notifications will appear here.</p>
            </div>
          ) : (
            <>
              {grouped.LIKE?.length ? (
                <Section title="Likes" count={grouped.LIKE.length} icon={<Heart size={12} className="text-rose-400" />}>
                  {grouped.LIKE.map((n) => <NotificationRow key={n.id} n={n} onClick={close} />)}
                </Section>
              ) : null}
              {grouped.COMMENT?.length ? (
                <Section title="Comments" count={grouped.COMMENT.length} icon={<MessageCircle size={12} className="text-sky-400" />}>
                  {grouped.COMMENT.map((n) => <NotificationRow key={n.id} n={n} onClick={close} />)}
                </Section>
              ) : null}
              {grouped.FOLLOW?.length ? (
                <Section title="Followers" count={grouped.FOLLOW.length} icon={<UserPlus size={12} className="text-emerald-400" />}>
                  {grouped.FOLLOW.map((n) => (
                    <FollowerRow key={n.id} n={n} currentUserId={currentUserId} onFollowBack={() => handleFollowBack(n.sender.id)} onClick={close} />
                  ))}
                </Section>
              ) : null}
              {grouped.MENTION?.length ? (
                <Section title="Mentions" count={grouped.MENTION.length} icon={<AtSign size={12} className="text-violet-400" />}>
                  {grouped.MENTION.map((n) => <NotificationRow key={n.id} n={n} onClick={close} />)}
                </Section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, count, icon, children }: { title: string; count: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-border last:border-b-0">
      <header className="flex items-center gap-2 bg-muted/50 px-4 py-2">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
        <span className="ml-auto text-[10px] font-medium text-muted-foreground/60">{count}</span>
      </header>
      <ul>{children}</ul>
    </section>
  );
}

function getNotificationHref(n: NotificationData) {
  if (n.type === "FOLLOW") return `/profile/${n.sender.username}`;
  if (n.postId) return `/post/${n.postId}`;
  return `/profile/${n.sender.username}`;
}

function NotificationRow({ n, onClick }: { n: NotificationData; onClick: () => void }) {
  const displayName = n.sender.name || n.sender.username;
  const actionText =
    n.type === "LIKE"
      ? n.comment ? "liked your comment" : "liked your post"
      : n.type === "COMMENT"
        ? "commented on your post"
        : n.type === "MENTION"
          ? n.comment ? "mentioned you in a comment" : "mentioned you in a post"
          : "started following you";

  return (
    <li>
      <Link href={getNotificationHref(n)} onClick={onClick} className={`flex items-start gap-3 px-4 py-3 transition hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}>
        <AvatarDisplay name={displayName} image={n.sender.profileImage} size="xs" className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{displayName}</span> {actionText}
          </p>
          {(n.type === "COMMENT" || n.type === "MENTION") && n.comment?.text && (
            <p className="mt-1 line-clamp-2 text-sm italic text-muted-foreground/70">&ldquo;{n.comment.text}&rdquo;</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground/50">{timeAgo(n.createdAt)}</p>
        </div>
      </Link>
    </li>
  );
}

function FollowerRow({ n, currentUserId, onFollowBack, onClick }: { n: NotificationData; currentUserId: string; onFollowBack: () => void; onClick: () => void }) {
  const displayName = n.sender.name || n.sender.username;
  return (
    <li>
      <div className={`flex items-center gap-3 px-4 py-3 transition hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}>
        <Link href={`/profile/${n.sender.username}`} onClick={onClick} className="flex items-center gap-3 min-w-0 flex-1">
          <AvatarDisplay name={displayName} image={n.sender.profileImage} size="xs" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">Started following you</p>
          </div>
        </Link>
        {n.sender.id !== currentUserId && (
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onFollowBack(); }}
            className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
          >
            Follow Back
          </button>
        )}
      </div>
    </li>
  );
}
