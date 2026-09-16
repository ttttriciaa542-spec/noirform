import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";
import { getCategoryFallbackImage, replaceBrokenImage } from "@/lib/catalog-images";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, image, className }: PageHeaderProps) {
  if (image) {
    return (
      <section className={cn("relative", className)}>
        <div className="relative h-[46vh] min-h-[280px] w-full overflow-hidden bg-secondary md:h-[52vh]">
          <img
            src={image}
            onError={(event) => replaceBrokenImage(event, getCategoryFallbackImage(title))}
            alt=""
            aria-hidden="true"
            className="reveal-in-image size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-ink/10" />
          <div className="edge absolute inset-x-0 bottom-0 pb-10">
            {eyebrow ? <p className="eyebrow text-background/80">{eyebrow}</p> : null}
            <h1 className="display-xl mt-3 max-w-2xl text-4xl text-background sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-background/85">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("edge pt-28 pb-10 md:pt-36", className)}>
      <Reveal>
        {eyebrow ? <p className="eyebrow text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="display-xl mt-3 text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </Reveal>
    </section>
  );
}
