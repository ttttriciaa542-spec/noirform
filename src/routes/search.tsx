import { createFileRoute } from "@tanstack/react-router"
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    const q = typeof search["q"] === "string" ? search["q"] : undefined;
    return q ? { q } : {};
  },
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: ({ deps }) => (deps.q ? fetchProducts({ search: deps.q }) : Promise.resolve([])),
  head: () => ({
    meta: [
      { title: "Search — BigDotCollections" },
      { name: "description", content: "Search swimwear, dresses and essentials at BigDotCollections." },
      { property: "og:title", content: "Search — BigDotCollections" },
      { property: "og:description", content: "Find your next piece." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const products = Route.useLoaderData();
  const { q } = Route.useSearch();

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={q ? `“${q}”` : `Search`}
        description={q ? `${products.length} result${products.length === 1 ? `` : `s`}` : `Type in the search bar to begin.`}
      />
      <div className="edge pb-24">
        {q && products.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matches"
            description="Try a different word, or browse the full shop."
            actionLabel="Shop all"
            actionTo="/shop"
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </>
  );
}
