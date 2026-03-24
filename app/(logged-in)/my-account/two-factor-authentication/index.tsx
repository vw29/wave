"use client";

import { disableTwoFactor, generateTwoFactorSecret, verifyTwoFactorCode } from "@/actions/auth/2fa";
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

  async function handleSteps() {
    const response = await generateTwoFactorSecret();
    if (!response.success) {
      toast.error(response.error!);
      return;
    }
    setStep(2);
    setTwoFactorSecret(response.secret!);
  }

  async function handleVerifyTwoFactor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await verifyTwoFactorCode(token);
    if (!response.success) {
      toast.error(response.error!);
      return;
    }
    toast.success(response.message!);
    setIsTwoFactorActivated(true);
    setStep(1);
    setToken("");
  }

  async function handleDisableTwoFactor() {
    const response = await disableTwoFactor();
    if (!response.success) {
      toast.error(response.error!);
      return;
    }
    toast.success(response.message!);
    setIsTwoFactorActivated(false);
    setStep(1);
    setToken("");
  }

  return (
    <>
      {isTwoFactorActivated && (
        <>
          <Button onClick={handleDisableTwoFactor}>Disable 2FA</Button>
        </>
      )}
      {!isTwoFactorActivated && (
        <>
          {step === 1 && (
            <div>
              <Button onClick={handleSteps}>Enable 2FA</Button>
            </div>
          )}
          {step === 2 && twoFactorSecret && (
            <div className="flex flex-col gap-2">
              <p>Scan this QR code with your Google Authenticator app</p>
              <QRCodeSVG value={twoFactorSecret} className="size-40 mx-auto" />
              <Button onClick={() => setStep(3)}>Next</Button>
              <Button onClick={() => setStep(1)}>Back</Button>
            </div>
          )}
          {step === 3 && (
            <div>
              <p className="text-muted-foreground">Enter the code from your authenticator app</p>
              <form onSubmit={handleVerifyTwoFactor} className="flex flex-col gap-2 mt-4">
                <InputOTP maxLength={6} value={token} onChange={(value) => setToken(value)}>
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
                <Button type="submit" disabled={token.length !== 6}>Verify</Button>
                <Button onClick={() => setStep(2)}>Back</Button>
              </form>
            </div>
          )}
        </>
      )}
    </>
  );
}
