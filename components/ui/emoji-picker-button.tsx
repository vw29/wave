"use client";

import { useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
  iconSize?: number;
  position?: "above" | "below";
}

export default function EmojiPickerButton({
  onEmojiSelect,
  iconSize = 16,
  position = "above",
}: EmojiPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        <Smile size={iconSize} />
      </button>
      {open && (
        <div
          className={`absolute z-50 ${
            position === "above" ? "bottom-9 right-0" : "top-9 right-0"
          }`}
        >
          <EmojiPicker
            onEmojiClick={(data) => {
              onEmojiSelect(data.emoji);
            }}
            theme={Theme.DARK}
            width={300}
            height={350}
            searchPlaceholder="Search emoji..."
            lazyLoadEmojis
          />
        </div>
      )}
    </div>
  );
}
