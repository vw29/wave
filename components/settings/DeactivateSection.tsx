"use client";

import { useState } from "react";
import DeleteAccountModal from "./DeleteAccountModal";

interface DeactivateSectionProps {
  isTwoFactorActivated: boolean;
}

export default function DeactivateSection({ isTwoFactorActivated }: DeactivateSectionProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-destructive">
            Delete Account
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm font-medium text-destructive underline-offset-4 hover:underline"
        >
          Delete account
        </button>
      </div>

      <DeleteAccountModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onKeep={() => {}}
        isTwoFactorActivated={isTwoFactorActivated}
      />
    </section>
  );
}
