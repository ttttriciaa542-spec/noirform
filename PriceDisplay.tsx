import { formatPrice, getDiscountPercentage } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Price + was-price + derived discount. Discount is never hand-written. */
export function PriceDisplay({ price, originalPrice, size = "sm", className }: PriceDisplayProps) {
  const discount = getDiscountPercentage(price, originalPrice);
  const textSize = size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("tabular-nums", textSize)}>{formatPrice(price)}</span>
      {discount ? (
        <>
          <span className="text-xs tabular-nums text-muted-foreground line-through">
            {formatPrice(originalPrice as number)}
          </span>
          <span className="text-[0.6875rem] font-medium tracking-[0.08em] text-accent uppercase">
            {discount}% off
          </span>
        </>
      ) : null}
    </div>
  );
}
