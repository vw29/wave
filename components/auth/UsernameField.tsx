"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { checkUsername } from "@/actions/auth/checkUsername";
import { Loader2, Check, X } from "lucide-react";

interface UsernameFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
}

export function UsernameField<T extends FieldValues>({
  control,
  name,
  label = FORM_TEXT.username.label,
  placeholder = FORM_TEXT.username.placeholder,
}: UsernameFieldProps<T>) {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const lastChecked = useRef("");

  const check = useCallback(async (value: string) => {
    const trimmed = value.trim().toLowerCase();

    if (trimmed.length < 3) {
      setStatus("idle");
      return;
    }

    if (trimmed === lastChecked.current) return;

    setStatus("checking");
    lastChecked.current = trimmed;

    const result = await checkUsername(trimmed);

    // Only update if this is still the latest check
    if (trimmed === lastChecked.current) {
      setStatus(result.available ? "available" : "taken");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type="text"
                placeholder={placeholder}
                autoComplete="username"
                onChange={(e) => {
                  field.onChange(e);
                  const val = e.target.value;
                  setStatus("idle");
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => check(val), 500);
                }}
                className="pr-9"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {status === "checking" && (
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                )}
                {status === "available" && (
                  <Check size={16} className="text-emerald-500" />
                )}
                {status === "taken" && (
                  <X size={16} className="text-destructive" />
                )}
              </div>
            </div>
          </FormControl>
          {status === "taken" && (
            <p className="text-sm text-destructive">This username is already taken</p>
          )}
          {status === "available" && (
            <p className="text-sm text-emerald-500">Username is available</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
