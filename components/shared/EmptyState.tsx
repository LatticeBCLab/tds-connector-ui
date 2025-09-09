import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RemixiconComponentType } from "@remixicon/react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon | RemixiconComponentType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon | RemixiconComponentType;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-12",
        className
      )}
    >
      <div className="bg-primary/10 mb-4 flex size-14 items-center justify-center rounded-full">
        <Icon className="text-primary size-8" />
      </div>
      <h3 className="text-foreground mb-1 text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm text-center text-sm">
          {description}
        </p>
      )}
      {action && (
        <Button className="mt-2" onClick={action.onClick} size="sm">
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
