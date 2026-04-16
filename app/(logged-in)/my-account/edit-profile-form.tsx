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
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  User,
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
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
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
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="flex flex-col gap-5"
        >
          {/* Profile Image */}
          <ProfileImageUpload
            value={form.watch("profileImage") || undefined}
            onUploadComplete={(url) => form.setValue("profileImage", url, { shouldDirty: true })}
            onRemove={() => form.setValue("profileImage", "", { shouldDirty: true })}
          />

          <Separator />

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_TEXT.username.label}</FormLabel>
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
                <FormLabel>{FORM_TEXT.name.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={FORM_TEXT.name.placeholder}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
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

          <Separator />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_TEXT.website.label}</FormLabel>
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
                <FormLabel>{FORM_TEXT.city.label}</FormLabel>
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
                <FormLabel>{FORM_TEXT.school.label}</FormLabel>
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
                <FormLabel>{FORM_TEXT.workplace.label}</FormLabel>
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

          <FormRootError message={form.formState.errors.root?.message} />

          <SubmitButton
            isSubmitting={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
            label="Save changes"
            loadingLabel="Saving..."
          />
        </fieldset>
      </form>
    </Form>
  );
}
