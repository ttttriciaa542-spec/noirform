import { Link, type LinkProps } from "@tanstack/react-router";
import { Reveal } from "@/components/common/Reveal";
import { cn } from "@/lib/utils";

interface EditorialSectionProps {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  to: NonNullable<LinkProps["to"]>;
  params?: Record<string, string>;
  ctaLabel: string;
  reverse?: boolean;
}

export function EditorialSection({
  eyebrow,
  title,
  body,
  image,
  to,
  params,
  ctaLabel,
  reverse = false,
}: EditorialSectionProps) {
  return (
    <section className="edge py-16 md:py-24">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
        <Reveal variant="image" className={cn(reverse && "md:order-2")}>
          <div className="aspect-[4/5] overflow-hidden bg-secondary md:aspect-[4/5]">
            <img
              src={image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={100} className={cn(reverse && "md:order-1")}>
          <p className="eyebrow text-muted-foreground">{eyebrow}</p>
          <h2 className="display-xl mt-4 text-4xl sm:text-5xl">{title}</h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
          <Link
            to={to}
            {...(params ? { params } : {})}
            className="label-caps mt-8 inline-flex h-12 items-center border border-foreground px-8 transition-colors hover:bg-foreground hover:text-background"
          >
            {ctaLabel}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
