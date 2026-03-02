import { useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import Link from "next/link";

export default function PasswordField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  field,
  autoComplete,
  href,
}: {
  label: string;
  field: ControllerRenderProps<TFieldValues, TName>;
  autoComplete: string;
  href?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormItem>
      <FormLabel className="flex items-center">
        {label}
        {href && (
          <Link
            href={href}
            className="ml-auto text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Forgot your password?
          </Link>
        )}
      </FormLabel>

      <div className="relative">
        <FormControl>
          <Input
            type={showPassword ? "text" : "password"}
            {...field}
            placeholder="********"
            autoComplete={autoComplete}
          />
        </FormControl>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <FormMessage />
    </FormItem>
  );
}
