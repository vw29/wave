"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editProfileSchema,
  type EditProfileSchema,
} from "@/lib/schemas";
import { FORM_TEXT, TOAST_MESSAGES } from "@/lib/constants";
import { updateFullProfile } from "@/actions/auth/updateFullProfile";
import { ProfileImageUpload } from "@/components/auth/ProfileImageUpload";
import { FormRootError } from "@/components/auth/form-root-error";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import {
  User,
  IdCard,
  AlignLeft,
  Globe,
  MapPin,
  GraduationCap,
  Briefcase,
} from "lucide-react";

interface EditProfileFormProps {
  user: {
    username: string;
    name: string | null;
    bio: string | null;
    profileImage: string | null;
    website: string | null;
    school: string | null;
    city: string | null;
    workplace: string | null;
  };
  onSaved?: () => void;
}

export default function EditProfileForm({ user, onSaved }: EditProfileFormProps) {
  const form = useForm<EditProfileSchema>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: user.username,
      name: user.name ?? "",
      bio: user.bio ?? "",
      profileImage: user.profileImage ?? "",
      website: user.website ?? "",
      school: user.school ?? "",
      city: user.city ?? "",
      workplace: user.workplace ?? "",
    },
  });

  async function onSubmit(data: EditProfileSchema) {
    form.clearErrors("root");
    const result = await updateFullProfile(data);
    if (!result.success) {
      form.setError("root", { message: result.message });
    } else {
      toast.success(TOAST_MESSAGES.profileUpdated);
      form.reset(data);
      onSaved?.();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="flex flex-col gap-6"
        >
          {/* Avatar — centered */}
          <ProfileImageUpload
            value={form.watch("profileImage") || undefined}
            onUploadComplete={(url) => form.setValue("profileImage", url, { shouldDirty: true })}
            onRemove={() => form.setValue("profileImage", "", { shouldDirty: true })}
          />

          {/* Form fields — 2-column grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <label className="mb-2 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {FORM_TEXT.username.label}
                  </label>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder={FORM_TEXT.username.placeholder}
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <label className="mb-2 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {FORM_TEXT.name.label}
                  </label>
                  <FormControl>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder={FORM_TEXT.name.placeholder}
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio — full width */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {FORM_TEXT.bio.label}
                  </label>
                  <FormControl>
                    <div className="relative">
                      <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        {...field}
                        placeholder={FORM_TEXT.bio.placeholder}
                        rows={2}
                        className="pl-9 resize-none"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <label className="mb-2 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {FORM_TEXT.website.label}
                  </label>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder={FORM_TEXT.website.placeholder}
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <label className="mb-2 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {FORM_TEXT.city.label}
                  </label>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder={FORM_TEXT.city.placeholder}
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* School */}
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <label className="mb-2 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {FORM_TEXT.school.label}
                  </label>
                  <FormControl>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder={FORM_TEXT.school.placeholder}
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Workplace */}
            <FormField
              control={form.control}
              name="workplace"
              render={({ field }) => (
                <FormItem>
                  <label className="mb-2 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {FORM_TEXT.workplace.label}
                  </label>
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder={FORM_TEXT.workplace.placeholder}
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormRootError message={form.formState.errors.root?.message} />

          <SubmitButton
            isSubmitting={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
            label="Save changes"
            loadingLabel="Saving..."
            className="w-full rounded-full"
          />
        </fieldset>
      </form>
    </Form>
  );
}
