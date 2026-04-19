"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import Toggle from "./Toggle";
import ConfirmModal from "./ConfirmModal";
import {
  disableTwoFactor,
  generateTwoFactorSecret,
  verifyTwoFactorCode,
} from "@/actions/auth/2fa";
import { QRCodeSVG } from "qrcode.react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface TwoFactorCardProps {
  initialEnabled: boolean;
}

export default function TwoFactorCard({ initialEnabled }: TwoFactorCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState<"idle" | "qr" | "verify">("idle");
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);

  async function handleToggle(value: boolean) {
    if (value) {
      // Enable flow: generate secret → show QR → verify code
      const response = await generateTwoFactorSecret();
      if (!response.success) {
        toast.error(response.message!);
        return;
      }
      setSecret(response.secret!);
      setStep("qr");
    } else {
      // Show warning modal before disabling
      setShowDisableModal(true);
    }
  }

  async function confirmDisable() {
    const response = await disableTwoFactor();
    if (!response.success) {
      toast.error(response.message!);
      return;
    }
    toast.success(response.message!);
    setEnabled(false);
    setStep("idle");
  }

  async function handleVerify() {
    const response = await verifyTwoFactorCode(token);
    if (!response.success) {
      toast.error(response.message!);
      return;
    }
    toast.success(response.message!);
    setEnabled(true);
    setStep("idle");
    setToken("");
  }

  function handleCancel() {
    setStep("idle");
    setSecret(null);
    setToken("");
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Two-Factor Authentication (2FA)
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  enabled ? "bg-amber-400" : "bg-muted-foreground/40"
                }`}
              />
              Status: {enabled ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>

        {step === "idle" && (
          <Toggle checked={enabled} onChange={handleToggle} />
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Add an extra layer of security to your account. When enabled, you&apos;ll
        need to enter a code from your authenticator app in addition to your
        password.
      </p>

      {/* QR Code step */}
      {step === "qr" && secret && (
        <div className="mt-5 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code with your authenticator app (e.g. Google
            Authenticator, Authy).
          </p>
          <QRCodeSVG
            value={secret}
            className="size-40"
            bgColor="transparent"
            fgColor="#ffffff"
          />
          <div className="flex gap-2 w-full max-w-xs">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => setStep("verify")}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Verify step */}
      {step === "verify" && (
        <div className="mt-5 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Enter the 6-digit code from your authenticator app to verify setup.
          </p>
          <InputOTP
            maxLength={6}
            value={token}
            onChange={(value) => setToken(value)}
            onComplete={handleVerify}
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
          <div className="flex gap-2 w-full max-w-xs">
            <Button variant="outline" onClick={() => setStep("qr")}>
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleVerify}
              disabled={token.length !== 6}
            >
              Verify
            </Button>
          </div>
        </div>
      )}
      {/* Disable 2FA warning modal */}
      <ConfirmModal
        open={showDisableModal}
        title="Disable Two-Factor Authentication?"
        description="This will significantly reduce the security of your account and make it easier for unauthorized users to gain access. You will no longer need a verification code to sign in."
        safeActionLabel="Keep Protected"
        dangerActionLabel="Disable 2FA"
        onDangerAction={confirmDisable}
        onClose={() => setShowDisableModal(false)}
      />
    </section>
  );
}
