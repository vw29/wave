"use client";

import { useState } from "react";
import { History, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordSchema } from "@/lib/schemas";
import { changePassword } from "@/actions/auth/changePassword";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormRootError } from "@/components/auth/form-root-error";
import toast from "react-hot-toast";

interface ChangePasswordCardProps {
  isTwoFactorActivated: boolean;
}

export default function ChangePasswordCard({ isTwoFactorActivated }: ChangePasswordCardProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [show2fa, setShow2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [pendingData, setPendingData] = useState<ChangePasswordSchema | null>(null);

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordSchema) {
    if (isTwoFactorActivated && !show2fa) {
      setPendingData(data);
      setShow2fa(true);
      return;
    }

    form.clearErrors("root");
    const result = await changePassword(data);
    if (!result.success) {
      form.setError("root", { message: result.message });
      // If 2FA was shown, go back to form so they can see the error
      if (show2fa) {
        setShow2fa(false);
        setTwoFactorCode("");
        setPendingData(null);
      }
    } else {
      toast.success("Password changed successfully");
      form.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setShow2fa(false);
      setTwoFactorCode("");
      setPendingData(null);
    }
  }

  async function handle2faSubmit() {
    if (!pendingData || twoFactorCode.length !== 6) return;
    await onSubmit(pendingData);
  }

  function handleCancel2fa() {
    setShow2fa(false);
    setTwoFactorCode("");
    setPendingData(null);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-2">
        <History size={18} className="text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Change Password
        </h2>
      </div>

      {!show2fa ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Current Password
                    </label>
                    <FormControl>
                      <div className="relative mt-2">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          {...field}
                          placeholder="Enter your current password"
                          autoComplete="current-password"
                          className="pr-10"
                        />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            tabIndex={-1}
                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                          >
                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        New Password
                      </label>
                      <FormControl>
                        <div className="relative mt-2">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            {...field}
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            className="pr-10"
                          />
                          {field.value && (
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              tabIndex={-1}
                              aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Confirm New Password
                      </label>
                      <FormControl>
                        <div className="relative mt-2">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            placeholder="Repeat new password"
                            autoComplete="new-password"
                            className="pr-10"
                          />
                          {field.value && (
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              tabIndex={-1}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormRootError message={form.formState.errors.root?.message} />

              <div className="flex items-center justify-end pt-2">
                <SubmitButton
                  isSubmitting={form.formState.isSubmitting}
                  label={isTwoFactorActivated ? "Continue" : "Update Password"}
                  loadingLabel="Updating..."
                />
              </div>
            </fieldset>
          </form>
        </Form>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Verify Identity
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={twoFactorCode}
              onChange={(value) => setTwoFactorCode(value)}
              onComplete={handle2faSubmit}
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

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel2fa}>
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handle2faSubmit}
              disabled={twoFactorCode.length !== 6}
            >
              Update Password
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
