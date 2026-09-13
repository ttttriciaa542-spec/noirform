import { createFileRoute } from "@tanstack/react-router"
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { fetchProducts } from "@/lib/api";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/wishlist")({
  loader: () => fetchProducts(),
  head: () => ({
    meta: [
      { title: "Saved Items — BigDotCollections" },
      { name: "description", content: "The BigDotCollections pieces you've saved for later." },
      { property: "og:title", content: "Saved Items — BigDotCollections" },
      { property: "og:description", content: "Pieces you've saved for later." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const allProducts = Route.useLoaderData();
  const { wishlist, hydrated } = useShop();
  const saved = allProducts.filter((product) => wishlist.includes(product.id));

  return (
    <>
      <PageHeader eyebrow="Your list" title="Saved items" />
      <div className="edge pb-24">
        {!hydrated ? null : saved.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any piece to keep it here."
            actionLabel="Browse the shop"
            actionTo="/shop"
          />
        ) : (
          <ProductGrid products={saved} />
        )}
      </div>
    </>
  );
}
