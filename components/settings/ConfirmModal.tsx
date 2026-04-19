"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  safeActionLabel?: string;
  dangerActionLabel?: string;
  onSafeAction?: () => void;
  onDangerAction?: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  safeActionLabel = "Keep Protected",
  dangerActionLabel = "Disable",
  onSafeAction,
  onDangerAction,
  onClose,
}: ConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const t = setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLButtonElement>("[data-safe-action]")
        ?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X size={18} />
        </button>

        {/* Warning icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/30">
            <AlertTriangle size={26} className="text-destructive" strokeWidth={2.2} />
          </div>
        </div>

        {/* Title */}
        <h2
          id="confirm-title"
          className="text-center text-2xl font-bold leading-tight text-foreground"
        >
          {title}
        </h2>

        {/* Description */}
        <p
          id="confirm-desc"
          className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-muted-foreground"
        >
          {description}
        </p>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button
            data-safe-action
            onClick={() => {
              onSafeAction?.();
              onClose();
            }}
            className="w-full rounded-xl py-3"
          >
            {safeActionLabel}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              onDangerAction?.();
              onClose();
            }}
            className="w-full rounded-xl py-3 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
          >
            {dangerActionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
