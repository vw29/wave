"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { PasswordField } from "./PasswordField";
import { FORM_TEXT } from "@/lib/constants";

interface ConfirmPasswordFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
}

export function ConfirmPasswordField<T extends FieldValues>({
  control,
  name,
  label = FORM_TEXT.confirmPassword.label,
  placeholder = FORM_TEXT.confirmPassword.placeholder,
}: ConfirmPasswordFieldProps<T>) {
  return (
    <PasswordField
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      autoComplete="new-password"
    />
  );
}
