import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel: string;
}

export function SubmitButton({ isSubmitting, disabled, label, loadingLabel }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting || disabled}>
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
