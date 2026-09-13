import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { formatPrice } from "@/lib/pricing";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — BigDotCollections" },
      { name: "description", content: "Complete your BigDotCollections order." },
      { property: "og:title", content: "Checkout — BigDotCollections" },
      { property: "og:description", content: "Complete your order." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

const regions = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Bono",
  "Upper East",
  "Upper West",
];

function CheckoutPage() {
  const { cart, subtotal, shipping, total, clearCart } = useShop();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Frontend only for now. Payment initialisation and verification will
    // happen server-side once the backend and Paystack integration exist.
    setSubmitting(true);
    const reference = `BDC-${Date.now().toString().slice(-8)}`;
    window.setTimeout(() => {
      clearCart();
      void navigate({ to: "/order-confirmation", search: { ref: reference } });
    }, 700);
  };

  if (cart.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Checkout" title="Nothing to check out" />
        <div className="edge pb-24">
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Add a few pieces before checking out."
            actionLabel="Shop now"
            actionTo="/shop"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Almost yours" title="Checkout" />
      <div className="edge grid gap-10 pb-24 lg:grid-cols-[1fr_380px]">
        <form onSubmit={onSubmit} className="space-y-10">
          <fieldset className="space-y-4">
            <legend className="label-caps text-xs">Contact</legend>
            <Field label="Full name" name="fullName" autoComplete="name" />
            <Field label="Email" name="email" type="email" autoComplete="email" />
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="label-caps text-xs">Delivery address</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-muted-foreground">Region</span>
                <select
                  name="region"
                  required
                  className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none focus-visible:border-foreground"
                >
                  {regions.map((region) => (
                    <option key={region}>{region}</option>
                  ))}
                </select>
              </label>
              <Field label="City / town" name="city" autoComplete="address-level2" />
            </div>
            <Field label="Street / landmark" name="street" autoComplete="street-address" />
            <label className="block">
              <span className="text-xs text-muted-foreground">Delivery notes (optional)</span>
              <textarea
                name="instructions"
                rows={3}
                className="mt-1.5 w-full resize-none border border-border bg-background p-3 text-sm outline-none focus-visible:border-foreground"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="label-caps text-xs">Payment</legend>
            <p className="border border-border bg-secondary p-4 text-xs leading-relaxed text-muted-foreground">
              Card and mobile money payments are not live yet. Placing an order here creates a
              demo confirmation only — no money is taken.
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="label-caps h-13 w-full bg-foreground py-4 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
          <h2 className="label-caps text-xs">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {cart.map((line) => (
              <li key={line.key} className="flex gap-3">
                <img
                  src={line.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="size-16 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{line.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.size} · {line.color} · ×{line.quantity}
                  </p>
                </div>
                <span className="text-sm">{formatPrice(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <Link to="/cart" className="mt-4 block text-xs text-muted-foreground hover:underline">
            Edit bag
          </Link>
        </aside>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required
        {...(autoComplete ? { autoComplete } : {})}
        className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none focus-visible:border-foreground"
      />
    </label>
  );
}
