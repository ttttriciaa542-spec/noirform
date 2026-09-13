import { createFileRoute } from "@tanstack/react-router"
import { PageHeader } from "@/components/common/PageHeader";
import { CatalogView } from "@/components/shop/CatalogView";
import { fetchCategories, fetchFacets, fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/sale")({
  loader: async () => {
    const [products, facets, categories] = await Promise.all([
      fetchProducts({ onSale: true }),
      fetchFacets(),
      fetchCategories(),
    ]);
    return { products, facets, categories };
  },
  head: () => ({
    meta: [
      { title: "Sale — BigDotCollections" },
      {
        name: "description",
        content: "Reduced pieces from BigDotCollections. Limited sizes, prices in GH₵.",
      },
      { property: "og:title", content: "Sale — BigDotCollections" },
      { property: "og:description", content: "Reduced pieces while sizes last." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/sale" },
    ],
    links: [{ rel: "canonical", href: "/sale" }],
  }),
  component: SalePage,
});

function SalePage() {
  const { products, facets, categories } = Route.useLoaderData();
  return (
    <>
      <PageHeader
        eyebrow="Markdowns"
        title="Sale"
        description="Reduced while sizes last. No code needed."
      />
      <div className="edge pb-20">
        <CatalogView products={products} facets={facets} categories={categories} />
      </div>
    </>
  );
}
