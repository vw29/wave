"use client";

import { Button } from "@/components/ui/button";

interface EmailCardProps {
  email: string;
  onChangeClick: () => void;
}

export default function EmailCard({ email, onChangeClick }: EmailCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Email Address
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{email}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Your primary email for notifications and recovery.
          </p>
        </div>

        <Button variant="outline" onClick={onChangeClick} className="shrink-0">
          Change Email
        </Button>
      </div>
    </section>
  );
}
