import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import campaign from "@/assets/campaign.jpg";

export function CampaignBanner() {
  const ref = useRef<HTMLElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setShift((progress - 0.5) * 60);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={ref} className="relative h-[70vh] min-h-[420px] overflow-hidden bg-ink">
      <img
        src={campaign}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full scale-110 object-cover"
        style={{ transform: `translate3d(0, ${shift}px, 0) scale(1.12)` }}
      />
      <div className="absolute inset-0 bg-ink/45" />
      <div className="edge relative flex h-full flex-col items-start justify-end pb-14 md:items-center md:justify-center md:pb-0 md:text-center">
        <h2 className="display-xl max-w-2xl text-4xl text-background sm:text-5xl lg:text-6xl">
          Your summer. Your rules.
        </h2>
        <Link
          to="/collections/$slug"
          params={{ slug: "beach-club" }}
          className="label-caps mt-8 inline-flex h-12 items-center bg-background px-8 text-foreground transition-opacity hover:opacity-90"
        >
          Shop the look
        </Link>
      </div>
    </section>
  );
}
