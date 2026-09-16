import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { Category } from "@/lib/types";
import { getCategoryFallbackImage, replaceBrokenImage } from "@/lib/catalog-images";

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-title" className="edge py-16 md:py-24">
      <SectionHeading
        eyebrow="Shop by category"
        title="Find your shape"
        linkTo="/shop"
        linkLabel="View all"
      />
      <div className="no-scrollbar mt-10 -mr-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pr-5 md:mr-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pr-0 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Reveal
            key={category.slug}
            delay={Math.min(index, 4) * 60}
            className="w-[64vw] shrink-0 snap-start sm:w-[42vw] md:w-auto"
          >
            <Link
              to="/shop/$category"
              params={{ category: category.slug }}
              className="group block"
              aria-label={`${category.name} — explore collection`}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={category.image}
                  onError={(event) => replaceBrokenImage(event, getCategoryFallbackImage(category.slug))}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="display-xl truncate text-xl text-background">{category.name}</h3>
                    <p className="label-caps mt-1 text-[0.625rem] text-background/80">
                      Explore collection
                    </p>
                  </div>
                  <ArrowUpRight
                    className="size-5 shrink-0 text-background transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Link
          to="/new-arrivals"
          className="label-caps border border-border px-5 py-2.5 transition-colors hover:bg-secondary"
        >
          New Arrivals
        </Link>
        <Link
          to="/sale"
          className="label-caps border border-border px-5 py-2.5 transition-colors hover:bg-secondary"
        >
          Sale
        </Link>
      </div>
    </section>
  );
}
