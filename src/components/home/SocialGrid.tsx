import { Instagram } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";

/** Static for now — swap for the Instagram Basic Display API later. */
export function SocialGrid({ images }: { images: string[] }) {
  return (
    <section aria-labelledby="social-title" className="edge py-16 md:py-24">
      <SectionHeading
        eyebrow="@bigdotcollections"
        title="Follow the look"
        description="See how the BigDot girl wears it."
        align="center"
      />
      <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {images.slice(0, 8).map((image, index) => (
          <Reveal key={`${image}-${index}`} delay={Math.min(index, 5) * 50} variant="fade">
            {/* Replace href with the real Instagram profile once available. */}
            <a href="#" aria-label="View on Instagram" className="group relative block">
              <div className="aspect-square overflow-hidden bg-secondary">
                <img
                  src={image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="absolute inset-0 grid place-items-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Instagram className="size-5 text-background" aria-hidden="true" />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
