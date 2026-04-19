"use client";

import { X } from "lucide-react";
import EditProfileForm from "@/app/(logged-in)/my-account/edit-profile-form";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    name: string | null;
    bio: string | null;
    profileImage: string | null;
    website: string | null;
    school: string | null;
    city: string | null;
    workplace: string | null;
  };
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-8 shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your profile information
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground transition hover:text-foreground"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Edit Form */}
        <div className="mt-6">
          <EditProfileForm user={user} onSaved={onClose} />
        </div>
      </div>
    </div>
  );
}
