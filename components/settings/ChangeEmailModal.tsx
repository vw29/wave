"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import toast from "react-hot-toast";

interface ChangeEmailModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isTwoFactorActivated: boolean;
}

export default function ChangeEmailModal({
  open,
  onClose,
  onSubmit,
  isTwoFactorActivated,
}: ChangeEmailModalProps) {
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");

  const handleClose = useCallback(() => {
    setPassword("");
    setNewEmail("");
    setTwoFactorCode("");
    setStep("credentials");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !newEmail) return;

    if (isTwoFactorActivated) {
      setStep("2fa");
    } else {
      submitEmailChange();
    }
  }

  function submitEmailChange() {
    // TODO: wire up change-email server action when implemented
    toast.success("Email update is not yet available");
    onSubmit(newEmail);
    setPassword("");
    setNewEmail("");
    setTwoFactorCode("");
    setStep("credentials");
  }

  function handle2faSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (twoFactorCode.length !== 6) return;
    submitEmailChange();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-2xl">
        {/* Top accent bar */}
        <div className="absolute left-8 right-8 top-0 h-[2px] rounded-b bg-primary/30" />

        {step === "credentials" ? (
          <>
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Change Email Address
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                To update your email, please confirm your current password and
                enter your new address.
              </p>
            </header>

            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Current Password
                </label>
                <div className="relative mt-2">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pr-11"
                  />
                  <Lock
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              {/* New Email */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  New Email Address
                </label>
                <div className="relative mt-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pr-11"
                  />
                  <Mail
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {isTwoFactorActivated ? "Continue" : "Update Email"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <header className="mb-6">
              <div className="flex items-center gap-3">
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
            </header>

            <form onSubmit={handle2faSubmit} className="space-y-5">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(value) => setTwoFactorCode(value)}
                  onComplete={() => submitEmailChange()}
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

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={twoFactorCode.length !== 6}
                >
                  Update Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTwoFactorCode("");
                    setStep("credentials");
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </form>
          </>
        )}

        {/* Footer trust signal */}
        <div className="mt-6 flex items-start gap-2 border-t border-border pt-4">
          <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-background">
            ✓
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your information is encrypted and stored securely.
          </p>
        </div>
      </div>
    </div>
  );
}
