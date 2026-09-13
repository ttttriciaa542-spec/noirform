import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  linkTo?: LinkProps["to"];
  linkLabel?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  linkTo,
  linkLabel,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-xl", align === "center" && "mx-auto text-center")}>
        {eyebrow ? <p className="eyebrow text-muted-foreground">{eyebrow}</p> : null}
        <h2 className="display-xl mt-3 text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {linkTo && linkLabel ? (
        <Link
          to={linkTo}
          className="label-caps group inline-flex shrink-0 items-center gap-2 border-b border-foreground/30 pb-1 transition-colors hover:border-foreground"
        >
          {linkLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
    </Reveal>
  );
}
