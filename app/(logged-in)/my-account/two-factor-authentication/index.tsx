"use client";

import {
  disableTwoFactor,
  generateTwoFactorSecret,
  verifyTwoFactorCode,
} from "@/actions/auth/2fa";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function TwoFactorAuthenticationForm({
  isTwoFactorActivated: initialIsTwoFactorActivated,
}: {
  isTwoFactorActivated: boolean;
}) {
  const [isTwoFactorActivated, setIsTwoFactorActivated] = useState(
    initialIsTwoFactorActivated,
  );
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [token, setToken] = useState("");

  async function handleEnableTwoFactor() {
    const response = await generateTwoFactorSecret();
    if (!response.success) {
      toast.error(response.message!);
      return;
    }
    setStep(2);
    setTwoFactorSecret(response.secret!);
  }

  async function submitVerification() {
    const response = await verifyTwoFactorCode(token);
    if (!response.success) {
      toast.error(response.message!);
      return;
    }
    toast.success(response.message!);
    setIsTwoFactorActivated(true);
    setStep(1);
    setToken("");
  }

  async function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitVerification();
  }

  async function handleDisableTwoFactor() {
    const response = await disableTwoFactor();
    if (!response.success) {
      toast.error(response.message!);
      return;
    }
    toast.success(response.message!);
    setIsTwoFactorActivated(false);
    setStep(1);
    setToken("");
  }

  if (isTwoFactorActivated) {
    return (
      <Button variant="destructive" onClick={handleDisableTwoFactor}>
        Disable 2FA
      </Button>
    );
  }

  return (
    <>
      {step === 1 && (
        <Button onClick={handleEnableTwoFactor}>Enable 2FA</Button>
      )}

      {step === 2 && twoFactorSecret && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Scan this QR code with your authenticator app (e.g. Google
            Authenticator, Authy).
          </p>
          <QRCodeSVG value={twoFactorSecret} className="size-40 mx-auto" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to verify setup.
          </p>
          <InputOTP
            maxLength={6}
            value={token}
            onChange={(value) => setToken(value)}
            onComplete={submitVerification}
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
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button className="flex-1" type="submit" disabled={token.length !== 6}>
              Verify
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
