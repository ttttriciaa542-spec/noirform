import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { CatalogView } from "@/components/shop/CatalogView";
import { fetchCollectionBySlug, fetchFacets, fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const collection = await fetchCollectionBySlug(params.slug);
    if (!collection) throw notFound();
    const [products, facets] = await Promise.all([
      fetchProducts({ collection: collection.slug }),
      fetchFacets(),
    ]);
    return { collection, products, facets };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Collection not found — BigDotCollections" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.collection.name} — BigDotCollections`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.collection.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.collection.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/collections/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/collections/${params.slug}` }],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { collection, products, facets } = Route.useLoaderData();
  return (
    <>
      <PageHeader
        eyebrow={collection.tagline}
        title={collection.name}
        description={collection.description}
        image={collection.image}
      />
      <div className="edge pb-20">
        <CatalogView products={products} facets={facets} showCategoryFilter={false} />
      </div>
    </>
  );
}
