import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { CatalogView } from "@/components/shop/CatalogView";
import { fetchCategories, fetchFacets, fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/shop/")({
  loader: async () => {
    const [products, facets, categories] = await Promise.all([
      fetchProducts(),
      fetchFacets(),
      fetchCategories(),
    ]);
    return { products, facets, categories };
  },
  head: () => ({
    meta: [
      { title: "Shop All — BigDotCollections" },
      {
        name: "description",
        content:
          "Browse the full BigDotCollections range: swimwear, dresses, tops, bottoms and accessories, priced in GH₵.",
      },
      { property: "og:title", content: "Shop All — BigDotCollections" },
      { property: "og:description", content: "The full BigDotCollections range, priced in GH₵." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { products, facets, categories } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        eyebrow="Everything"
        title="Shop all"
        description={`${products.length} pieces, ready to wear.`}
      />
      <div className="edge pb-20">
        <CatalogView products={products} facets={facets} categories={categories} />
      </div>
    </>
  );
}
