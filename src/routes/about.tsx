import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Reveal } from "@/components/common/Reveal";
import editorial from "@/assets/editorial.jpg";
import campaign from "@/assets/campaign.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — BigDotCollections" },
      {
        name: "description",
        content:
          "BigDotCollections is a Ghanaian women's fashion label making swimwear and everyday pieces designed to be noticed.",
      },
      { property: "og:title", content: "Our Story — BigDotCollections" },
      {
        property: "og:description",
        content: "A Ghanaian women's fashion label made for confidence.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Made in Ghana, worn everywhere"
        description="BigDotCollections started with a simple idea: pieces that make you feel like yourself, only louder."
        image={campaign}
      />

      <div className="edge grid gap-10 pb-16 md:grid-cols-2 md:gap-16">
        <Reveal variant="image">
          <div className="aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src={editorial}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={100} className="self-center">
          <h2 className="display-xl text-3xl sm:text-4xl">What we stand for</h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              We design in small runs so each drop stays considered — fabrics that hold their
              shape in the sun, cuts that flatter real bodies, and colours pulled from the coast.
            </p>
            <p>
              Every piece is priced in cedis, made to be worn hard, and backed by people you can
              actually reach.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="edge grid gap-6 pb-24 sm:grid-cols-3">
        {[
          { title: "Considered design", body: "Small runs, careful fabric choices, no filler." },
          { title: "Fair pricing", body: "Cedi pricing with no hidden import surprises." },
          { title: "Real support", body: "Message us and a person answers, not a bot." },
        ].map((item, index) => (
          <Reveal key={item.title} delay={index * 80}>
            <div className="h-full border border-border p-6">
              <h3 className="label-caps text-[0.625rem]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="edge pb-24 text-center">
        <Link
          to="/shop"
          className="label-caps inline-flex h-12 items-center bg-foreground px-10 text-background transition-opacity hover:opacity-90"
        >
          Shop the collection
        </Link>
      </div>
    </>
  );
}
