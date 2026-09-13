import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PriceDisplay } from "./PriceDisplay";
import { WishlistButton } from "./WishlistButton";
import { getDiscountPercentage } from "@/lib/pricing";
import { useShop } from "@/store/shop";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  /** Renders eagerly for above-the-fold cards. */
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const primary = product.images[0];
  const secondary = product.images[1];
  const discount = getDiscountPercentage(product.price, product.originalPrice);
  const soldOut = product.stock <= 0;

  return (
    <article className={cn("group relative", className)}>
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block focus-visible:outline-offset-4"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          {primary ? (
            <img
              src={primary.url}
              alt={primary.alt}
              width={primary.width ?? 1024}
              height={primary.height ?? 1280}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "size-full object-cover transition-all duration-700 ease-out",
                secondary ? "md:group-hover:opacity-0" : "group-hover:scale-[1.03]",
              )}
            />
          ) : null}
          {secondary ? (
            <img
              src={secondary.url}
              alt=""
              aria-hidden="true"
              width={secondary.width ?? 1024}
              height={secondary.height ?? 1280}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 hidden size-full object-cover opacity-0 transition-opacity duration-700 ease-out md:block md:group-hover:opacity-100"
            />
          ) : null}

          <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {soldOut ? (
              <span className="label-caps bg-foreground/90 px-2.5 py-1 text-[0.625rem] text-background">
                Sold out
              </span>
            ) : null}
            {discount ? (
              <span className="label-caps bg-accent px-2.5 py-1 text-[0.625rem] text-accent-foreground">
                {discount}% off
              </span>
            ) : null}
            {product.isNew && !discount && !soldOut ? (
              <span className="label-caps bg-background/90 px-2.5 py-1 text-[0.625rem]">New</span>
            ) : null}
          </div>
        </div>
      </Link>

      <WishlistButton
        productId={product.id}
        productName={product.name}
        className="absolute top-2.5 right-2.5"
      />

      {!soldOut ? <QuickView product={product} /> : null}

      <div className="mt-3 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm leading-snug font-normal">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:underline">
              {product.name}
            </Link>
          </h3>
        </div>
        <PriceDisplay price={product.price} originalPrice={product.originalPrice} />
        {product.colors.length > 1 ? (
          <ul className="flex items-center gap-1.5 pt-0.5" aria-label="Available colours">
            {product.colors.map((color) => (
              <li
                key={color.name}
                title={color.name}
                className="size-2.5 rounded-full border border-border"
                style={{ backgroundColor: color.swatch }}
              >
                <span className="sr-only">{color.name}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

function QuickView({ product }: { product: Product }) {
  const { addToCart, setCartOpen } = useShop();
  const [size, setSize] = useState(product.sizes[0] ?? "One size");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="label-caps absolute inset-x-2.5 bottom-[calc(100%-100%)] hidden translate-y-2 bg-background/95 py-2.5 text-[0.6875rem] opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block"
          style={{ top: "calc(100% - 4.25rem)" }}
        >
          <span className="inline-flex items-center gap-2">
            <Eye className="size-3.5" aria-hidden="true" />
            Quick view
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-none p-0 sm:max-w-2xl">
        <div className="grid sm:grid-cols-2">
          <img
            src={product.images[0]?.url}
            alt={product.images[0]?.alt ?? product.name}
            width={1024}
            height={1280}
            loading="lazy"
            className="hidden size-full object-cover sm:block"
          />
          <div className="p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="display-xl text-2xl">{product.name}</DialogTitle>
            </DialogHeader>
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice}
              size="md"
              className="mt-3"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            <fieldset className="mt-6">
              <legend className="label-caps mb-2 text-muted-foreground">Size</legend>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    aria-pressed={size === option}
                    className={cn(
                      "min-w-11 border px-3 py-2 text-sm transition-colors",
                      size === option
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              onClick={() => {
                addToCart(product, { size, color: product.colors[0]?.name ?? "Default" });
                setOpen(false);
                setCartOpen(true);
                toast("Added to bag", { description: `${product.name} — ${size}` });
              }}
              className="label-caps mt-6 h-12 w-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
            >
              Add to bag
            </button>
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="label-caps mt-3 block text-center text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
