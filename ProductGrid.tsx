import { Reveal } from "@/components/common/Reveal";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  className?: string;
  /** Number of cards rendered eagerly. */
  priorityCount?: number;
}

export function ProductGrid({ products, className, priorityCount = 2 }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14",
        className,
      )}
    >
      {products.map((product, index) => (
        <Reveal key={product.id} delay={Math.min(index, 5) * 70}>
          <ProductCard product={product} priority={index < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}

/** Horizontal, swipeable rail — used for best sellers on mobile. */
export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-x-6 md:overflow-visible md:px-0">
      {products.map((product) => (
        <div key={product.id} className="w-[62vw] shrink-0 snap-start sm:w-[38vw] md:w-auto">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
