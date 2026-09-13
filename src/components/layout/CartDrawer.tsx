import { Link } from "@tanstack/react-router";
import { ShoppingBag, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { EmptyState } from "@/components/common/EmptyState";
import { formatPrice } from "@/lib/pricing";
import { FREE_SHIPPING_THRESHOLD, useShop } from "@/store/shop";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, setQuantity, subtotal, shipping, total } =
    useShop();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="label-caps text-left text-xs">
            Your bag ({cart.length})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-5">
            <EmptyState
              icon={ShoppingBag}
              title="Your bag is empty"
              description="Pieces you add will show up here."
              actionLabel="Start shopping"
              actionTo="/shop"
              onAction={() => setCartOpen(false)}
            />
          </div>
        ) : (
          <>
            <div className="border-b border-border bg-secondary px-5 py-3 text-xs text-muted-foreground">
              {remaining > 0
                ? `Spend ${formatPrice(remaining)} more for free delivery.`
                : "You've unlocked free delivery."}
            </div>

            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {cart.map((line) => (
                <li key={line.key} className="flex gap-4 py-4">
                  <Link
                    to="/product/$slug"
                    params={{ slug: line.slug }}
                    onClick={() => setCartOpen(false)}
                    className="size-24 shrink-0 overflow-hidden bg-secondary"
                  >
                    <img
                      src={line.image}
                      alt={line.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{line.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {line.size} · {line.color}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.key)}
                        aria-label={`Remove ${line.name} from bag`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <QuantitySelector
                        size="sm"
                        value={line.quantity}
                        onChange={(quantity) => setQuantity(line.key, quantity)}
                      />
                      <span className="text-sm">{formatPrice(line.price * line.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-5">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-medium">{formatPrice(total)}</dd>
                </div>
              </dl>
              <div className="mt-5 grid gap-2">
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="label-caps flex h-12 items-center justify-center bg-foreground text-background transition-opacity hover:opacity-90"
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="label-caps flex h-12 items-center justify-center border border-border transition-colors hover:bg-secondary"
                >
                  View bag
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
