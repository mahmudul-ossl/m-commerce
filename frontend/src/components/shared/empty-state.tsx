import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-16 text-center", className)}>
      <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" />
      </span>
      <h2 className="font-display text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
