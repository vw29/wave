import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel: string;
  className?: string;
}

export function SubmitButton({ isSubmitting, disabled, label, loadingLabel, className }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting || disabled} className={className}>
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
