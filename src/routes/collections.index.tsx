import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Reveal } from "@/components/common/Reveal";
import { fetchCollections } from "@/lib/api";
import { getCollectionFallbackImage, replaceBrokenImage } from "@/lib/catalog-images";

export const Route = createFileRoute("/collections/")({
  loader: () => fetchCollections(),
  head: () => ({
    meta: [
      { title: "Collections — BigDotCollections" },
      {
        name: "description",
        content: "Curated BigDotCollections edits: The Summer Edit, Vacation Mode, Beach Club and Night Out.",
      },
      { property: "og:title", content: "Collections — BigDotCollections" },
      { property: "og:description", content: "Curated edits, styled end to end." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/collections" },
    ],
    links: [{ rel: "canonical", href: "/collections" }],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const collections = Route.useLoaderData();

  return (
    <>
      <PageHeader
        eyebrow="Edits"
        title="Collections"
        description="Curated groupings, styled from first look to last."
      />
      <div className="edge grid gap-6 pb-20 md:grid-cols-2">
        {collections.map((collection, index) => (
          <Reveal key={collection.slug} delay={index * 80}>
            <Link
              to="/collections/$slug"
              params={{ slug: collection.slug }}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary md:aspect-[3/2]">
                <img
                  src={collection.image}
                  onError={(event) => replaceBrokenImage(event, getCollectionFallbackImage(collection.slug))}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="label-caps text-[0.625rem] text-background/80">
                    {collection.tagline}
                  </p>
                  <h2 className="display-xl mt-2 text-3xl text-background">{collection.name}</h2>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
