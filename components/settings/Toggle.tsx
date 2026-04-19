"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:pointer-events-none
        ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-foreground shadow-md transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
