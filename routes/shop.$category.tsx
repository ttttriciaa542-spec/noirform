import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { CatalogView } from "@/components/shop/CatalogView";
import { fetchCategoryBySlug, fetchFacets, fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/shop/$category")({
  loader: async ({ params }) => {
    const category = await fetchCategoryBySlug(params.category);
    if (!category) throw notFound();
    const [products, facets] = await Promise.all([
      fetchProducts({ category: category.slug }),
      fetchFacets(),
    ]);
    return { category, products, facets };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category not found — BigDotCollections" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.category.name} — BigDotCollections`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.category.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.category.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/shop/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/shop/${params.category}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products, facets } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.name}
        description={category.description}
        image={category.image}
      />
      <div className="edge pb-20">
        <CatalogView products={products} facets={facets} showCategoryFilter={false} />
      </div>
    </>
  );
}
