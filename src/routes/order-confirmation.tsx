import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, PackageCheck, Heart, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { getAdminOrderByReference } from "@/lib/admin-store";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => {
    const ref = typeof search["ref"] === "string" ? search["ref"] : undefined;
    return ref ? { ref } : {};
  },
  head: () => ({
    meta: [
      { title: "Order Confirmed — BigDotCollections" },
      { name: "description", content: "Your BigDotCollections order has been received." },
      { property: "og:title", content: "Order Confirmed — BigDotCollections" },
      { property: "og:description", content: "Your order has been received." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { ref } = Route.useSearch();
  const order = ref ? getAdminOrderByReference(ref) : undefined;
  const itemCount = order?.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0) ?? 0;

  return (
    <div className="edge pb-16 pt-28 sm:pb-24 sm:pt-32">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <div
          className="reveal-in mx-auto flex size-20 items-center justify-center rounded-full bg-green-600/15 text-green-600 sm:size-24"
          style={{ animationDelay: "0ms", opacity: 0 }}
        >
          <CheckCircle2 className="size-10 sm:size-12" aria-hidden="true" />
        </div>
        <p
          className="eyebrow reveal-in mt-6 text-muted-foreground"
          style={{ animationDelay: "100ms", opacity: 0 }}
        >
          Order Confirmed
        </p>
        <h1
          className="display-xl reveal-in mt-3 text-5xl sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "180ms", opacity: 0 }}
        >
          Thank you
          <br />
          {order?.customer?.name?.split(" ")[0] ?? "friend"}
        </h1>
        <p
          className="reveal-in mt-6 max-w-md mx-auto text-sm leading-relaxed text-muted-foreground"
          style={{ animationDelay: "260ms", opacity: 0 }}
        >
          {order
            ? `Your order ${ref} is confirmed and being prepared for dispatch. A confirmation has been sent to ${order.customerSnapshot?.email ?? order.customer?.email ?? "your inbox"}.`
            : "Your order has been received. We'll take it from here."}
        </p>
      </div>

      {/* Order Items Preview */}
      {order && order.items.length > 0 && (
        <div className="reveal-in mt-14 mx-auto max-w-3xl" style={{ animationDelay: "340ms", opacity: 0 }}>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <p className="eyebrow text-muted-foreground">Order summary</p>
            <p className="label-caps text-muted-foreground">{itemCount} item{itemCount === 1 ? "" : "s"}</p>
          </div>
          <div className="divide-y divide-border">
            {order.items.slice(0, 3).map((item, i) => (
              <div
                key={item.productId ?? i}
                className="flex items-center justify-between py-4 gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name ?? "Product"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.size ? `${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}
                    {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground tabular-nums shrink-0">
                  {typeof item.price === "number" ? formatPrice(item.price) : "—"}
                </p>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="py-4 text-center">
                <p className="text-xs text-muted-foreground">+{order.items.length - 3} more item{order.items.length > 4 ? "s" : ""}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4 mt-1">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-display tracking-tight text-foreground">
              {order ? formatPrice(order.total) : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="reveal-in mt-12 mx-auto max-w-3xl" style={{ animationDelay: "420ms", opacity: 0 }}>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="grid size-9 place-items-center rounded-full bg-secondary">
              <PackageCheck className="size-4 text-foreground" aria-hidden="true" />
            </div>
            <p className="eyebrow text-muted-foreground">Delivery address</p>
          </div>
          {order ? (
            <div className="text-sm text-foreground leading-relaxed">
              <p>{order.shipping?.street ?? "Delivery address pending"}</p>
              <p className="text-muted-foreground mt-0.5">
                {[order.shipping?.city, order.shipping?.region]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Address pending</p>
          )}
        </div>
      </div>

      {/* Reference Number Block */}
      <div
        className="reveal-in mx-auto mt-12 max-w-3xl text-center"
        style={{ animationDelay: "500ms", opacity: 0 }}
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-secondary/30 px-6 py-3">
          <span className="eyebrow text-muted-foreground">Reference</span>
          <span className="text-sm font-mono text-foreground tabular-nums">{ref ?? "BDC-0000"}</span>
          <Heart className="size-3 text-clay" aria-hidden="true" />
        </div>
      </div>

      {/* CTAs */}
      <div className="reveal-in mx-auto mt-14 flex max-w-3xl flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "580ms", opacity: 0 }}>
        <Link
          to="/shop"
          className="label-caps group inline-flex h-12 items-center justify-center gap-2 bg-foreground px-8 text-background transition-opacity hover:opacity-90"
        >
          Keep shopping
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
        <Link
          to="/track-order"
          className="label-caps inline-flex h-12 items-center justify-center border border-border px-8 transition-colors hover:bg-secondary"
        >
          Track order
        </Link>
      </div>

      {/* Help note */}
      <div className="reveal-in mx-auto mt-10 max-w-3xl text-center" style={{ animationDelay: "660ms", opacity: 0 }}>
        <p className="text-xs text-muted-foreground">
          Questions? Contact our team at{" "}
          <Link to="/contact" className="underline underline-offset-2 hover:text-foreground">
            support@bigdotcollections.com
          </Link>
        </p>
      </div>
    </div>
  );
}
