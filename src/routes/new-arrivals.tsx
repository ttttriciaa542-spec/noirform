import { createFileRoute } from "@tanstack/react-router"
import { PageHeader } from "@/components/common/PageHeader";
import { CatalogView } from "@/components/shop/CatalogView";
import { fetchCategories, fetchFacets, fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/new-arrivals")({
  loader: async () => {
    const [products, facets, categories] = await Promise.all([
      fetchProducts({ isNew: true, sort: "newest" }),
      fetchFacets(),
      fetchCategories(),
    ]);
    return { products, facets, categories };
  },
  head: () => ({
    meta: [
      { title: "New Arrivals — BigDotCollections" },
      {
        name: "description",
        content: "The latest BigDotCollections drops: fresh swimwear, dresses and sets in GH₵.",
      },
      { property: "og:title", content: "New Arrivals — BigDotCollections" },
      { property: "og:description", content: "The latest drops, fresh off the rail." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/new-arrivals" },
    ],
    links: [{ rel: "canonical", href: "/new-arrivals" }],
  }),
  component: NewArrivals,
});

function NewArrivals() {
  const { products, facets, categories } = Route.useLoaderData();
  return (
    <>
      <PageHeader
        eyebrow="Just landed"
        title="New arrivals"
        description="Fresh off the rail, updated every week."
      />
      <div className="edge pb-20">
        <CatalogView products={products} facets={facets} categories={categories} />
      </div>
    </>
  );
}
