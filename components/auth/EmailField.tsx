"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FORM_TEXT } from "@/lib/constants";

interface EmailFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
}

export function EmailField<T extends FieldValues>({
  control,
  name,
  label = FORM_TEXT.email.label,
  placeholder = FORM_TEXT.email.placeholder,
}: EmailFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="email"
              placeholder={placeholder}
              autoComplete="email"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
