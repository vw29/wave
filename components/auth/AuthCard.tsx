import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BackLink } from "./back-link";

interface AuthCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function AuthCard({
  icon: Icon,
  title,
  description,
  children,
  footer,
  backHref,
  backLabel,
  className,
}: AuthCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-sm min-w-0 sm:min-w-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        className,
      )}
    >
      <CardHeader className="text-center space-y-3">
        {backHref && backLabel && (
          <div className="flex justify-start -mb-1">
            <BackLink href={backHref}>{backLabel}</BackLink>
          </div>
        )}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="text-balance">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <>
          <Separator className="mx-auto w-3/4!" />
          <CardFooter className="flex-col gap-2 pt-2 pb-1">{footer}</CardFooter>
        </>
      )}
    </Card>
  );
}
