"use client";

import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  open,
  title = "Delete Comment?",
  description = "This action cannot be undone. Are you sure you want to remove this comment from the conversation?",
  cancelLabel = "Cancel",
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);

    const t = setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLButtonElement>("[data-cancel]")
        ?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      >
        {/* Body */}
        <div className="p-7">
          {/* Header with icon + title */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/30">
              <Trash2 size={22} className="text-destructive" strokeWidth={2.2} />
            </div>
            <h2
              id="delete-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              {title}
            </h2>
          </div>

          {/* Description */}
          <p
            id="delete-desc"
            className="mt-5 text-sm leading-relaxed text-muted-foreground"
          >
            {description}
          </p>

          {/* Actions */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <Button
              data-cancel
              variant="outline"
              onClick={onCancel}
              className="rounded-xl py-3"
            >
              {cancelLabel}
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className="rounded-xl py-3"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
