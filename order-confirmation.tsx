import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

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

  return (
    <div className="edge flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
      <CheckCircle2 className="size-10" aria-hidden="true" />
      <h1 className="display-xl mt-6 text-4xl sm:text-5xl">Thank you</h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Your order has been received. You'll get a confirmation once payments go live — for now
        this is a preview of the real flow.
      </p>
      {ref && (
        <p className="label-caps mt-6 border border-border px-5 py-3 text-xs">Order {ref}</p>
      )}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/shop"
          className="label-caps inline-flex h-12 items-center justify-center bg-foreground px-8 text-background transition-opacity hover:opacity-90"
        >
          Keep shopping
        </Link>
        <Link
          to="/account/orders"
          className="label-caps inline-flex h-12 items-center justify-center border border-border px-8 transition-colors hover:bg-secondary"
        >
          View orders
        </Link>
      </div>
    </div>
  );
}
