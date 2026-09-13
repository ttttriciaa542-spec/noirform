import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the mobile carousel dots in sync with the swipe position.
  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const onScroll = () => {
      const index = Math.round(node.scrollLeft / node.clientWidth);
      setActive((current) => (current === index ? current : index));
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  const current = images[active] ?? images[0];

  const goToImage = (index: number) => {
    if (!images.length) return;
    setActive((index + images.length) % images.length);
  };

  const moveImage = (direction: "prev" | "next") => {
    if (!images.length) return;
    const nextIndex = direction === "prev" ? active - 1 : active + 1;
    setActive((nextIndex + images.length) % images.length);
  };

  return (
    <div>
      {/* Mobile: image switcher with arrows and thumbnails */}
      <div className="lg:hidden">
        {current ? (
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-secondary">
              <img
                key={current.id}
                src={current.url}
                alt={current.alt}
                width={current.width ?? 1024}
                height={current.height ?? 1280}
                loading="eager"
                decoding="async"
                className="size-full object-cover"
              />
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => moveImage("prev")}
                  className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center border border-border bg-background/90 text-foreground backdrop-blur-sm"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => moveImage("next")}
                  className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center border border-border bg-background/90 text-foreground backdrop-blur-sm"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {images.length > 1 ? (
          <div className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => goToImage(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "h-16 w-16 shrink-0 snap-start overflow-hidden border bg-secondary transition-all",
                  index === active ? "border-foreground ring-1 ring-foreground" : "border-transparent opacity-70",
                )}
              >
                <img
                  src={image.url}
                  alt=""
                  width={image.width ?? 1024}
                  height={image.height ?? 1280}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: main image + thumbnails */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[84px_1fr]">
        <ul className="flex flex-col gap-3">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "block aspect-[4/5] w-full overflow-hidden border transition-colors",
                  index === active ? "border-foreground" : "border-transparent hover:border-border",
                )}
              >
                <img
                  src={image.url}
                  alt=""
                  width={image.width ?? 1024}
                  height={image.height ?? 1280}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
        <div className="group relative aspect-[4/5] overflow-hidden bg-secondary">
          {current ? (
            <img
              key={current.id}
              src={current.url}
              alt={current.alt}
              width={current.width ?? 1024}
              height={current.height ?? 1280}
              className="reveal-in-fade size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : null}
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="label-caps absolute right-4 bottom-4 inline-flex items-center gap-2 bg-background/90 px-3 py-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <Expand className="size-3.5" aria-hidden="true" />
            Zoom
          </button>
        </div>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          className="h-[92vh] max-w-[96vw] rounded-none border-0 bg-background p-0 sm:max-w-[92vw]"
        >
          <DialogTitle className="sr-only">{productName} — full screen images</DialogTitle>
          <div className="relative flex h-full items-center justify-center">
            {current ? (
              <img
                src={current.url}
                alt={current.alt}
                className="max-h-full max-w-full object-contain"
              />
            ) : null}
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 grid size-10 place-items-center bg-background/90"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setActive((i) => (i + 1) % images.length)}
                  className="absolute right-3 grid size-10 place-items-center bg-background/90"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
