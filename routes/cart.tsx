import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { formatPrice } from "@/lib/pricing";
import { FREE_SHIPPING_THRESHOLD, useShop } from "@/store/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — BigDotCollections" },
      { name: "description", content: "Review the pieces in your BigDotCollections bag." },
      { property: "og:title", content: "Your Bag — BigDotCollections" },
      { property: "og:description", content: "Review your bag before checkout." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, removeFromCart, setQuantity, subtotal, shipping, total } = useShop();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <>
      <PageHeader eyebrow="Checkout" title="Your bag" />
      <div className="edge pb-24">
        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Once you add pieces, they'll appear here."
            actionLabel="Start shopping"
            actionTo="/shop"
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-border border-y border-border">
              {cart.map((line) => (
                <li key={line.key} className="flex gap-4 py-5">
                  <Link
                    to="/product/$slug"
                    params={{ slug: line.slug }}
                    className="h-32 w-24 shrink-0 overflow-hidden bg-secondary sm:h-40 sm:w-32"
                  >
                    <img
                      src={line.image}
                      alt={line.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to="/product/$slug"
                          params={{ slug: line.slug }}
                          className="truncate text-sm font-medium hover:underline"
                        >
                          {line.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {line.size} · {line.color}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.key)}
                        aria-label={`Remove ${line.name}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <QuantitySelector
                        value={line.quantity}
                        onChange={(quantity) => setQuantity(line.key, quantity)}
                      />
                      <span className="text-sm">{formatPrice(line.price * line.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
              <h2 className="label-caps text-xs">Order summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-medium">{formatPrice(total)}</dd>
                </div>
              </dl>
              {remaining > 0 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Spend {formatPrice(remaining)} more for free delivery.
                </p>
              )}
              <Link
                to="/checkout"
                className="label-caps mt-6 flex h-12 items-center justify-center bg-foreground text-background transition-opacity hover:opacity-90"
              >
                Checkout
              </Link>
              <Link
                to="/shop"
                className="label-caps mt-2 flex h-12 items-center justify-center border border-border transition-colors hover:bg-secondary"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
