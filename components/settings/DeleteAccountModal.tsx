"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UserX, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { deleteAccount } from "@/actions/auth/deleteAccount";

interface DeleteAccountModalProps {
  open: boolean;
  onKeep: () => void;
  onClose: () => void;
  isTwoFactorActivated: boolean;
}

export default function DeleteAccountModal({
  open,
  onKeep,
  onClose,
  isTwoFactorActivated,
}: DeleteAccountModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [step, setStep] = useState<"confirm" | "2fa">("confirm");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setPassword("");
    setTwoFactorCode("");
    setStep("confirm");
    setError(null);
    setIsDeleting(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);

    const t = setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLButtonElement>("[data-keep]")
        ?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, handleClose]);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    if (isTwoFactorActivated) {
      setError(null);
      setStep("2fa");
    } else {
      performDelete();
    }
  }

  async function performDelete() {
    setError(null);
    setIsDeleting(true);

    const result = await deleteAccount(password);

    if (result && !result.success) {
      setError(result.message);
      setIsDeleting(false);
      // Go back to password step so they can see the error
      if (step === "2fa") {
        setStep("confirm");
        setTwoFactorCode("");
      }
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl"
      >
        {step === "confirm" ? (
          <>
            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/30">
                <UserX size={24} className="text-destructive" strokeWidth={2} />
              </div>
            </div>

            {/* Title */}
            <h2
              id="delete-account-title"
              className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground"
            >
              Delete Your Account?
            </h2>

            {/* Description */}
            <p
              id="delete-account-desc"
              className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-muted-foreground"
            >
              Deleting your account is{" "}
              <strong className="font-semibold text-foreground">permanent</strong>.
              All your data will be removed and cannot be recovered.
            </p>

            {/* What happens list */}
            <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
              <ul className="space-y-2.5">
                <li className="flex items-center gap-3">
                  <CheckCircle2
                    size={16}
                    className="flex-shrink-0 text-destructive"
                    strokeWidth={2}
                  />
                  <span className="text-sm text-muted-foreground">
                    Your profile and posts will be permanently deleted.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2
                    size={16}
                    className="flex-shrink-0 text-destructive"
                    strokeWidth={2}
                  />
                  <span className="text-sm text-muted-foreground">
                    Your followers and following lists will be removed.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2
                    size={16}
                    className="flex-shrink-0 text-destructive"
                    strokeWidth={2}
                  />
                  <span className="text-sm text-muted-foreground">
                    This action cannot be undone.
                  </span>
                </li>
              </ul>
            </div>

            {/* Password confirmation */}
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Confirm your password
                </label>
                <div className="relative mt-2">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isDeleting}
                    className="pr-11"
                  />
                  <Lock
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-destructive">{error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  data-keep
                  type="button"
                  onClick={() => {
                    onKeep();
                    handleClose();
                  }}
                  disabled={isDeleting}
                  className="w-full rounded-xl py-3"
                >
                  Keep Account
                </Button>

                <button
                  type="submit"
                  disabled={isDeleting || !password.trim()}
                  className="w-full rounded-xl bg-transparent px-5 py-3 text-sm font-medium text-muted-foreground transition hover:text-destructive disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isDeleting ? "Deleting..." : isTwoFactorActivated ? "Continue" : "Delete Account"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* 2FA verification step */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Verify Identity
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <InputOTP
                maxLength={6}
                value={twoFactorCode}
                onChange={(value) => setTwoFactorCode(value)}
                onComplete={() => performDelete()}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setTwoFactorCode("");
                  setStep("confirm");
                }}
                disabled={isDeleting}
              >
                Back
              </Button>
              <button
                onClick={performDelete}
                disabled={isDeleting || twoFactorCode.length !== 6}
                className="rounded-xl bg-transparent px-5 py-2 text-sm font-medium text-muted-foreground transition hover:text-destructive disabled:opacity-50 disabled:pointer-events-none"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
