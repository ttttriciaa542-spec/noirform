import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { formatPrice } from "@/lib/pricing";
import { addAdminOrder, fetchAdminDiscounts } from "@/lib/admin-store";
import type { AdminOrder } from "@/lib/admin-types";
import { calculateOrderTotals, normalizeCouponCode } from "@/lib/discounts";
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
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: discounts = [] } = useQuery({
    queryKey: ["/admin/discounts"],
    queryFn: fetchAdminDiscounts,
  });

  const orderTotals = useMemo(() => {
    const discount = discounts.find((item) => normalizeCouponCode(item.code) === normalizeCouponCode(appliedCoupon ?? ""));
    return calculateOrderTotals(
      cart.map((line) => ({
        productId: line.productId,
        name: line.name,
        sku: line.productId,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
        price: line.price,
        image: line.image,
      })),
      shipping,
      discount,
    );
  }, [appliedCoupon, cart, discounts, shipping]);

  const handleApplyCoupon = () => {
    const normalized = normalizeCouponCode(couponInput);
    if (!normalized) {
      setCouponError("Enter a discount code.");
      setAppliedCoupon(null);
      return;
    }

    const match = discounts.find((discount) => normalizeCouponCode(discount.code) === normalized);
    if (!match) {
      setCouponError("That code is not valid or is no longer active.");
      setAppliedCoupon(null);
      return;
    }

    setCouponError("");
    setAppliedCoupon(match.code);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const reference = `BDC-${Date.now().toString().slice(-8)}`;
    const customerName = String(form.get("fullName") ?? "Customer");
    const customerEmail = String(form.get("email") ?? "customer@example.com");
    const customerPhone = String(form.get("phone") ?? "");
    const region = String(form.get("region") ?? "");
    const city = String(form.get("city") ?? "");
    const street = String(form.get("street") ?? "");
    const instructions = String(form.get("instructions") ?? "");
    const appliedDiscount = discounts.find((discount) => normalizeCouponCode(discount.code) === normalizeCouponCode(appliedCoupon ?? ""));

    const newOrder: AdminOrder = {
      id: `ord-${Date.now()}`,
      reference,
      createdAt: new Date().toISOString(),
      customer: {
        id: `cust-${Date.now()}`,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      customerSnapshot: {
        fullName: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      items: cart.map((line) => ({
        productId: line.productId,
        name: line.name,
        sku: line.productId,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
        price: line.price,
        image: line.image,
      })),
      subtotal: orderTotals.subtotal,
      discount: orderTotals.discountAmount,
      shippingFee: orderTotals.shippingFee,
      total: orderTotals.total,
      paymentStatus: "Paid",
      status: "Pending",
      deliveryMethod: "Standard delivery",
      shipping: {
        fullName: customerName,
        phone: customerPhone,
        region,
        city,
        street,
        instructions: instructions || undefined,
      },
      payment: {
        method: "Paystack",
        transactionId: reference,
        paidAt: new Date().toISOString(),
      },
    };

    addAdminOrder(newOrder);

    window.setTimeout(() => {
      clearCart();
      void navigate({ to: "/order-confirmation", search: { ref: reference } as any });
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
            <Field label="Full name" name="fullName" autoComplete="name" placeholder="e.g. Ama Mensah" />
            <Field label="Email" name="email" type="email" autoComplete="email" placeholder="e.g. you@example.com" />
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. 024 123 4567" />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="label-caps text-xs">Delivery address</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-muted-foreground">Region</span>
                <select
                  name="region"
                  required
                  defaultValue=""
                  className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none focus-visible:border-foreground"
                >
                  <option value="" disabled>
                    Select region
                  </option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="City / town" name="city" autoComplete="address-level2" placeholder="e.g. Accra" />
            </div>
            <Field label="Street / landmark" name="street" autoComplete="street-address" placeholder="e.g. East Legon, House 12" />
            <label className="block">
              <span className="text-xs text-muted-foreground">Delivery notes (optional)</span>
              <textarea
                name="instructions"
                rows={3}
                placeholder="e.g. Call before delivery"
                className="mt-1.5 w-full resize-none border border-border bg-background p-3 text-sm outline-none focus-visible:border-foreground"
              />
            </label>
          </fieldset>

          <div className="space-y-3 rounded-md border border-border p-4">
            <label className="block text-xs text-muted-foreground">Discount code</label>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="Enter code"
                className="h-11 flex-1 border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-foreground"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="h-11 border border-border bg-secondary px-4 text-sm font-medium hover:bg-secondary/80"
              >
                Apply
              </button>
            </div>
            {couponError ? <p className="text-xs text-red-600">{couponError}</p> : null}
            {appliedCoupon ? <p className="text-xs text-emerald-600">Code applied: {appliedCoupon}</p> : null}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="label-caps h-13 w-full bg-foreground py-4 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Placing order…" : `Place order · ${formatPrice(orderTotals.total)}`}
          </button>
        </form>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
          <h2 className="label-caps text-xs">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {cart.map((line) => (
              <li key={line.key} className="flex gap-3">
                <img
                  src={line.image || "/assets/editorial.jpg"}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/assets/editorial.jpg";
                  }}
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
              <dd>{formatPrice(orderTotals.subtotal)}</dd>
            </div>
            {orderTotals.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-600">
                <dt>Discount</dt>
                <dd>-{formatPrice(orderTotals.discountAmount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{orderTotals.shippingFee === 0 ? "Free" : formatPrice(orderTotals.shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(orderTotals.total)}</dd>
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
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        {...(autoComplete ? { autoComplete } : {})}
        className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-foreground"
      />
    </label>
  );
}
