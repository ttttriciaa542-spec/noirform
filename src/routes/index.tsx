import { createFileRoute } from "@tanstack/react-router"
import { Hero } from "@/components/home/Hero";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { EditorialSection } from "@/components/home/EditorialSection";
import { CampaignBanner } from "@/components/home/CampaignBanner";
import { SocialGrid } from "@/components/home/SocialGrid";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductRail } from "@/components/shop/ProductGrid";
import { fetchCategories, fetchProducts } from "@/lib/api";
import editorial from "@/assets/editorial.jpg";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [categories, newArrivals, bestSellers] = await Promise.all([
      fetchCategories(),
      fetchProducts({ isNew: true, sort: "newest", limit: 8 }),
      fetchProducts({ isBestSeller: true, sort: "best-selling", limit: 8 }),
    ]);
    return { categories, newArrivals, bestSellers };
  },
  head: () => ({
    meta: [
      { title: "BigDotCollections — Swimwear & Fashion for Women in Ghana" },
      {
        name: "description",
        content:
          "Premium swimwear, dresses and everyday essentials for the modern Ghanaian woman. Shop new arrivals in GH₵ with nationwide delivery.",
      },
      { property: "og:title", content: "BigDotCollections — Made to be noticed" },
      {
        property: "og:description",
        content: "Premium swimwear, dresses and essentials, priced in GH₵.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { categories, newArrivals, bestSellers } = Route.useLoaderData();
  const socialImages = [...newArrivals, ...bestSellers]
    .map((product) => product.images[0]?.url)
    .filter((url): url is string => Boolean(url));

  return (
    <>
      <Hero />
      <CategoryStrip categories={categories} />

      <section aria-labelledby="new-arrivals" className="edge py-16 md:py-24">
        <SectionHeading
          eyebrow="Just landed"
          title="New arrivals"
          linkTo="/new-arrivals"
          linkLabel="See all"
        />
        <div className="mt-10">
          <ProductRail products={newArrivals} />
        </div>
      </section>

      <EditorialSection
        eyebrow="The summer edit"
        title="Sun-soaked, all season"
        body="Pieces cut to move with you — from the shoreline to the long way home. Designed in Accra, made for everywhere."
        image={editorial}
        to="/collections/$slug"
        params={{ slug: "the-summer-edit" }}
        ctaLabel="Shop the edit"
      />

      <section aria-labelledby="best-sellers" className="edge py-16 md:py-24">
        <SectionHeading
          eyebrow="Loved by you"
          title="Best sellers"
          linkTo="/shop"
          linkLabel="Shop all"
        />
        <div className="mt-10">
          <ProductRail products={bestSellers} />
        </div>
      </section>

      <CampaignBanner />
      <SocialGrid images={socialImages} />
    </>
  );
}
