import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminAppearanceSettings } from "@/lib/admin-store";

const fallbackHeroImage = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80";

export function Hero() {
  const [offset, setOffset] = useState(0);
  const { data: appearance } = useQuery({
    queryKey: ["/admin/appearance"],
    queryFn: fetchAdminAppearanceSettings,
  });

  const heroImage = appearance?.homepageBannerUrl || fallbackHeroImage;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setOffset(Math.min(window.scrollY * 0.18, 90)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative h-[92svh] min-h-[560px] w-full overflow-hidden bg-ink">
      <picture>
        <source media="(min-width: 768px)" srcSet={heroImage} />
        <img
          src={heroImage}
          alt="BigDotCollections home hero"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="reveal-in-image absolute inset-0 size-full scale-105 object-cover"
          style={{ transform: `translate3d(0, ${offset}px, 0) scale(1.08)` }}
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/35" />

      <div className="edge relative flex h-full flex-col justify-end pb-20 md:justify-center md:pb-0">
        <div className="max-w-xl">
          <p
            className="eyebrow reveal-in-fade text-background/80"
            style={{ animationDelay: "120ms", opacity: 0 }}
          >
            BigDotCollections
          </p>
          <h1
            className="display-xl reveal-in mt-4 text-5xl text-background sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "220ms", opacity: 0 }}
          >
            Made to be
            <br />
            noticed.
          </h1>
          <p
            className="reveal-in mt-5 max-w-sm text-sm leading-relaxed text-background/85 sm:text-base"
            style={{ animationDelay: "360ms", opacity: 0 }}
          >
            Swimwear, essentials and statement pieces made for every mood.
          </p>
          <div
            className="reveal-in mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "480ms", opacity: 0 }}
          >
            <Link
              to="/new-arrivals"
              className="label-caps inline-flex h-12 items-center justify-center bg-background px-8 text-foreground transition-opacity hover:opacity-90"
            >
              Shop new arrivals
            </Link>
            <Link
              to="/shop/$category"
              params={{ category: "swimwear" }}
              className="label-caps inline-flex h-12 items-center justify-center border border-background/70 px-8 text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Shop swimwear
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
