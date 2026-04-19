"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlockListModal from "./BlockListModal";

export default function BlockListCard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ShieldOff size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Blocked Users
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage users you&apos;ve blocked. Blocked users can&apos;t see your profile or posts.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
            className="shrink-0"
          >
            View list
          </Button>
        </div>
      </section>

      <BlockListModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
