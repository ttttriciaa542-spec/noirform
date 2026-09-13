import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

const faqs = [
  {
    q: "How do I know my size?",
    a: "Every product page has a size guide with bust, waist and hip measurements. If you're between sizes, we recommend sizing up for swimwear tops.",
  },
  {
    q: "How long does delivery take?",
    a: "1–2 working days in Accra and Tema, 2–5 working days elsewhere in Ghana.",
  },
  {
    q: "What does delivery cost?",
    a: "A flat GH₵35 anywhere in Ghana, and free once your bag passes GH₵800.",
  },
  {
    q: "Can I return an item?",
    a: "Yes — within 7 days of delivery, unworn and with tags. Swimwear bottoms are excluded for hygiene reasons.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Card and mobile money payments are being set up. For now, checkout is a preview and no money is taken.",
  },
  {
    q: "Do you restock sold-out pieces?",
    a: "Sometimes. Drops are made in small runs, so message us and we'll let you know if a restock is planned.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — BigDotCollections" },
      {
        name: "description",
        content: "Answers on sizing, delivery, returns and payment at BigDotCollections.",
      },
      { property: "og:title", content: "FAQ — BigDotCollections" },
      { property: "og:description", content: "Sizing, delivery, returns and payment answers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);

  return (
    <>
      <PageHeader eyebrow="Help" title="Frequently asked" />
      <div className="edge max-w-2xl pb-24">
        <div className="divide-y divide-border border-y border-border">
          {faqs.map((item) => {
            const expanded = open === item.q;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : item.q)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  {expanded ? (
                    <Minus className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Plus className="size-4 shrink-0" aria-hidden="true" />
                  )}
                </button>
                {expanded && (
                  <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
