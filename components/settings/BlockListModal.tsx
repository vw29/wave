"use client";

import { useEffect, useState, useTransition } from "react";
import { X, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlockedUsers, type BlockedUser } from "@/actions/social/getBlockedUsers";
import { unblockUser } from "@/actions/social/unblockUser";
import AvatarDisplay from "@/components/ui/avatar-display";
import toast from "react-hot-toast";

interface BlockListModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BlockListModal({ open, onClose }: BlockListModalProps) {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getBlockedUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function handleUnblock(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    startTransition(async () => {
      const result = await unblockUser(userId);
      if ("error" in result && result.error) {
        toast.error(result.error);
        const data = await getBlockedUsers();
        setUsers(data);
      } else {
        toast.success("User unblocked");
      }
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Blocked Users</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground transition hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <ShieldOff size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No blocked users</p>
              <p className="text-xs text-muted-foreground mt-1">
                Users you block will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => {
                const displayName = u.name || u.username;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarDisplay name={displayName} image={u.profileImage} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{u.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(u.id)}
                      disabled={isPending}
                      className="shrink-0 ml-3"
                    >
                      Unblock
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
