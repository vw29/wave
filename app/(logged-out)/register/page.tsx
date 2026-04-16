"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { updateProfile } from "@/actions/auth/updateProfile";
import { autoLogin } from "@/actions/auth/autoLogin";
import toast from "react-hot-toast";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const passwordRef = useRef("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const step1Form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const step2Form = useForm<ProfileSchema>({
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
        setStep(2);
      }
    } catch {
      toast.error(ERROR_MESSAGES.generic);
    }
  }

  async function onStep2Submit(data: ProfileSchema) {
    try {
      step2Form.clearErrors("root");
      const result = await updateProfile(registeredEmail, data);
      if (!result.success) {
        step2Form.setError("root", { message: result.message });
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

  const step2Disabled = step2Form.formState.isSubmitting || isLoggingIn;

  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      <AuthCard
        icon={UserPlus}
        title={step === 1 ? AUTH_TEXT.register.title : AUTH_TEXT.register.step2Title}
        description={step === 1 ? AUTH_TEXT.register.description : AUTH_TEXT.register.step2Description}
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
        ) : (
          <div key="step2" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <Form {...step2Form}>
              <form onSubmit={step2Form.handleSubmit(onStep2Submit)}>
                <fieldset
                  disabled={step2Disabled}
                  className="flex flex-col gap-4"
                >
                  <ProfileImageUpload
                    value={step2Form.watch("profileImage")}
                    onUploadComplete={(url) =>
                      step2Form.setValue("profileImage", url)
                    }
                    onRemove={() => step2Form.setValue("profileImage", "")}
                  />
                  <FormField
                    control={step2Form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.name.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={FORM_TEXT.name.placeholder}
                            autoComplete="name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step2Form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.bio.label}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={FORM_TEXT.bio.placeholder}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step2Form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.website.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder={FORM_TEXT.website.placeholder}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step2Form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.school.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={FORM_TEXT.school.placeholder}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step2Form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.city.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={FORM_TEXT.city.placeholder}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step2Form.control}
                    name="workplace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{FORM_TEXT.workplace.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={FORM_TEXT.workplace.placeholder}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {step2Form.formState.errors.root?.message && (
                    <p className="text-sm text-destructive text-center">
                      {step2Form.formState.errors.root.message}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={step2Disabled}
                  >
                    {step2Form.formState.isSubmitting
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
                    disabled={step2Disabled}
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
