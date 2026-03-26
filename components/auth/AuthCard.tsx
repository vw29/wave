import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface AuthCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({
  icon: Icon,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto rounded-full bg-muted p-3 w-fit">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="flex-col gap-3">{footer}</CardFooter>}
    </Card>
  );
}
