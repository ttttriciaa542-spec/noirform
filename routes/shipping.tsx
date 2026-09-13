import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery — BigDotCollections" },
      {
        name: "description",
        content:
          "Delivery timelines and rates across Ghana, with free delivery on orders over GH₵800.",
      },
      { property: "og:title", content: "Shipping & Delivery — BigDotCollections" },
      { property: "og:description", content: "Delivery rates and timelines across Ghana." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shipping" },
    ],
    links: [{ rel: "canonical", href: "/shipping" }],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  const rows = [
    { area: "Accra & Tema", time: "1–2 working days", cost: formatPrice(35) },
    { area: "Kumasi & Takoradi", time: "2–3 working days", cost: formatPrice(35) },
    { area: "Other regions", time: "3–5 working days", cost: formatPrice(35) },
    { area: "Orders over GH₵800", time: "Standard timelines", cost: "Free" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Delivery"
        title="Shipping"
        description="Flat-rate delivery nationwide, free once your bag passes GH₵800."
      />
      <div className="edge max-w-2xl pb-24">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground text-left">
              <th className="label-caps py-3 text-[0.625rem]">Area</th>
              <th className="label-caps py-3 text-[0.625rem]">Time</th>
              <th className="label-caps py-3 text-right text-[0.625rem]">Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.area} className="border-b border-border">
                <td className="py-4">{row.area}</td>
                <td className="py-4 text-muted-foreground">{row.time}</td>
                <td className="py-4 text-right">{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Orders placed before 2pm are processed the same working day. You'll get a message from
            our team when your parcel leaves us.
          </p>
          <p>
            We currently deliver within Ghana only. International shipping is on the way.
          </p>
        </div>
      </div>
    </>
  );
}
