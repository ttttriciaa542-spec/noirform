import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: LinkProps["to"];
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className,
}: EmptyStateProps) {
  const actionClass =
    "label-caps mt-8 inline-flex h-11 items-center justify-center bg-primary px-8 text-primary-foreground transition-opacity hover:opacity-90";

  return (
    <div className={cn("flex flex-col items-center px-6 py-20 text-center", className)}>
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <h2 className="display-xl mt-6 text-2xl sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className={actionClass}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && !actionTo && onAction ? (
        <button type="button" onClick={onAction} className={actionClass}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
