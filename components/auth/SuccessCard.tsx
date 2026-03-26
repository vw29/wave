import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CircleCheck } from "lucide-react";

interface SuccessCardProps {
  title: string;
  description: string;
  linkHref: string;
  linkText: string;
}

export function SuccessCard({
  title,
  description,
  linkHref,
  linkText,
}: SuccessCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
        <CircleCheck className="h-6 w-6 text-emerald-500" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground text-balance">
          {description}
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href={linkHref}>{linkText}</Link>
      </Button>
    </div>
  );
}
