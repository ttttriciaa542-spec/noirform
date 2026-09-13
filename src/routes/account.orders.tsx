import { createFileRoute } from "@tanstack/react-router"
import { Package } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "Your Orders — BigDotCollections" },
      { name: "description", content: "Track your BigDotCollections orders." },
      { property: "og:title", content: "Your Orders — BigDotCollections" },
      { property: "og:description", content: "Track your orders." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/account/orders" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <>
      <PageHeader eyebrow="Account" title="Your orders" />
      <div className="edge pb-24">
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Order history will appear here once accounts and payments are live."
          actionLabel="Start shopping"
          actionTo="/shop"
        />
      </div>
    </>
  );
}
