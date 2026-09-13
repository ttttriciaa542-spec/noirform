import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchanges — BigDotCollections" },
      {
        name: "description",
        content:
          "How to return or exchange a BigDotCollections order within 7 days of delivery.",
      },
      { property: "og:title", content: "Returns & Exchanges — BigDotCollections" },
      { property: "og:description", content: "Returns and exchanges within 7 days." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/returns" },
    ],
    links: [{ rel: "canonical", href: "/returns" }],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  const steps = [
    { title: "Get in touch", body: "Message us within 7 days of delivery with your order number." },
    { title: "Pack it up", body: "Keep the item unworn, unwashed and with tags attached." },
    { title: "Send or swap", body: "We'll arrange pickup or an exchange for a different size." },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Peace of mind"
        title="Returns & exchanges"
        description="Seven days to change your mind on unworn pieces."
      />
      <div className="edge max-w-2xl pb-24">
        <ol className="space-y-8">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-5">
              <span className="display-xl text-3xl text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="label-caps text-[0.625rem]">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 border border-border p-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            For hygiene reasons, swimwear bottoms and earrings can't be returned once the hygiene
            seal is removed. Sale items are exchange-only.
          </p>
          <Link to="/contact" className="mt-4 inline-block text-foreground underline">
            Start a return
          </Link>
        </div>
      </div>
    </>
  );
}
