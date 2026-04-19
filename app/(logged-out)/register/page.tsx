"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  AuthCard,
  EmailField,
  UsernameField,
  PasswordField,
  ConfirmPasswordField,
  ProfileImageUpload,
} from "@/components/auth";
import {
  registerSchema,
  type RegisterSchema,
  profileSchema,
  type ProfileSchema,
} from "@/lib/schemas";
import { AUTH_TEXT, FORM_TEXT, TOAST_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerUser } from "@/actions/auth/register";
import { verifyEmailCode } from "@/actions/auth/verifyEmailCode";
import { sendVerificationCode } from "@/actions/auth/sendVerificationCode";
import { updateProfile } from "@/actions/auth/updateProfile";
import { autoLogin } from "@/actions/auth/autoLogin";
import toast from "react-hot-toast";
import Link from "next/link";
import { UserPlus, Mail, ShieldCheck } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const passwordRef = useRef("");
  const usernameRef = useRef("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Step 2: Email verification
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const step1Form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const step3Form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      profileImage: "",
      website: "",
      school: "",
      city: "",
      workplace: "",
    },
  });

  async function handleAutoLogin() {
    setIsLoggingIn(true);
    try {
      const result = await autoLogin(registeredEmail, passwordRef.current);
      if (result.success) {
        toast.success(TOAST_MESSAGES.registerSuccess);
        router.push("/");
      } else {
        toast.success(TOAST_MESSAGES.registerSuccess);
        router.push("/login");
      }
    } catch {
      toast.success(TOAST_MESSAGES.registerSuccess);
      router.push("/login");
    }
  }

  async function onStep1Submit(data: RegisterSchema) {
    try {
      step1Form.clearErrors("root");
      const result = await registerUser(data);
      if (!result.success) {
        step1Form.setError("root", { message: result.message });
      } else {
        setRegisteredEmail(result.email);
        passwordRef.current = data.password;
        usernameRef.current = data.username;
        setStep(2);
      }
    } catch {
      toast.error(ERROR_MESSAGES.generic);
    }
  }

  async function handleVerifyCode() {
    if (verificationCode.length !== 6) return;
    setVerifyError(null);
    setIsVerifying(true);
    try {
      const result = await verifyEmailCode({
        email: registeredEmail,
        code: verificationCode,
        username: usernameRef.current,
        password: passwordRef.current,
      });
      if (!result.success) {
        setVerifyError(result.message ?? "Verification failed");
      } else {
        toast.success("Email verified!");
        setStep(3);
      }
    } catch {
      setVerifyError(ERROR_MESSAGES.generic);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    setIsResending(true);
    setVerifyError(null);
    try {
      const result = await sendVerificationCode(registeredEmail, usernameRef.current);
      if (result.success) {
        toast.success("New code sent to your email");
        setVerificationCode("");
      } else {
        setVerifyError("message" in result ? result.message : "Failed to resend code");
      }
    } catch {
      setVerifyError(ERROR_MESSAGES.generic);
    } finally {
      setIsResending(false);
    }
  }

  async function onStep3Submit(data: ProfileSchema) {
    try {
      step3Form.clearErrors("root");
      const result = await updateProfile(registeredEmail, data);
      if (!result.success) {
        step3Form.setError("root", { message: result.message });
      } else {
        await handleAutoLogin();
      }
    } catch {
      toast.error(ERROR_MESSAGES.generic);
    }
  }

  async function onSkip() {
    await handleAutoLogin();
  }

  const footer = (
    <div className="text-muted-foreground text-sm text-center">
      {AUTH_TEXT.register.hasAccount}{" "}
      <Link href="/login" className="underline hover:text-foreground">
        {AUTH_TEXT.common.signIn}
      </Link>
    </div>
  );

  const step3Disabled = step3Form.formState.isSubmitting || isLoggingIn;

  const stepTitle =
    step === 1
      ? AUTH_TEXT.register.title
      : step === 2
        ? "Verify your email"
        : AUTH_TEXT.register.step2Title;

  const stepDescription =
    step === 1
      ? AUTH_TEXT.register.description
      : step === 2
        ? `We sent a 6-digit code to ${registeredEmail}`
        : AUTH_TEXT.register.step2Description;

  const stepIcon = step === 2 ? Mail : UserPlus;

  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      <AuthCard
        icon={stepIcon}
        title={stepTitle}
        description={stepDescription}
        footer={step === 1 ? footer : undefined}
      >
        {step === 1 ? (
          <div key="step1" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <Form {...step1Form}>
              <form onSubmit={step1Form.handleSubmit(onStep1Submit)}>
                <fieldset
                  disabled={step1Form.formState.isSubmitting}
                  className="flex flex-col gap-4"
                >
                  <EmailField control={step1Form.control} name="email" />
                  <UsernameField control={step1Form.control} name="username" />
                  <PasswordField
                    control={step1Form.control}
                    name="password"
                    autoComplete="new-password"
                  />
                  <ConfirmPasswordField
                    control={step1Form.control}
                    name="passwordConfirmation"
                  />
                  {step1Form.formState.errors.root?.message && (
                    <p className="text-sm text-destructive text-center">
                      {step1Form.formState.errors.root.message}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={step1Form.formState.isSubmitting}
                  >
                    {step1Form.formState.isSubmitting
                      ? AUTH_TEXT.register.submitting
                      : AUTH_TEXT.register.submit}
                  </Button>
                </fieldset>
              </form>
            </Form>
          </div>
        ) : step === 2 ? (
          <div key="step2" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={24} />
              </div>

              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={(value) => {
                  setVerificationCode(value);
                  setVerifyError(null);
                }}
                onComplete={() => handleVerifyCode()}
                autoFocus
                disabled={isVerifying}
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

              {verifyError && (
                <p className="text-sm text-destructive text-center">{verifyError}</p>
              )}

              <Button
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || isVerifying}
                className="w-full"
              >
                {isVerifying ? "Verifying..." : "Verify email"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-foreground underline underline-offset-4 hover:text-foreground/80 disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend"}
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div key="step3" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <Form {...step3Form}>
              <form onSubmit={step3Form.handleSubmit(onStep3Submit)}>
                <fieldset
                  disabled={step3Disabled}
                  className="flex flex-col gap-4"
                >
                  <ProfileImageUpload
                    value={step3Form.watch("profileImage")}
                    onUploadComplete={(url) =>
                      step3Form.setValue("profileImage", url)
                    }
                    onRemove={() => step3Form.setValue("profileImage", "")}
                  />
                  <FormField
                    control={step3Form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.name.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`${FORM_TEXT.name.placeholder} (Optional)`}
                            autoComplete="name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step3Form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.bio.label}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={`${FORM_TEXT.bio.placeholder} (Optional)`}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step3Form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.website.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder={`${FORM_TEXT.website.placeholder} (Optional)`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step3Form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.school.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`${FORM_TEXT.school.placeholder} (Optional)`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step3Form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.city.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`${FORM_TEXT.city.placeholder} (Optional)`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step3Form.control}
                    name="workplace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.workplace.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`${FORM_TEXT.workplace.placeholder} (Optional)`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {step3Form.formState.errors.root?.message && (
                    <p className="text-sm text-destructive text-center">
                      {step3Form.formState.errors.root.message}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={step3Disabled}
                  >
                    {step3Form.formState.isSubmitting
                      ? AUTH_TEXT.register.step2Submitting
                      : isLoggingIn
                        ? AUTH_TEXT.register.loggingIn
                        : AUTH_TEXT.register.step2Submit}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={onSkip}
                    disabled={step3Disabled}
                  >
                    {AUTH_TEXT.register.skip}
                  </Button>
                </fieldset>
              </form>
            </Form>
          </div>
        )}
      </AuthCard>
    </main>
  );
}
