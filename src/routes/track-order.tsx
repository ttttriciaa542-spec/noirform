import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, MapPin, PackageCheck, Search, Truck } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { fetchTrackOrder } from "@/lib/api";
import type { TrackOrderDetails } from "@/lib/types";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Order — BigDotCollections" },
      { name: "description", content: "Track a BigDotCollections order." },
      { property: "og:title", content: "Track Order — BigDotCollections" },
      { property: "og:description", content: "Track your beachwear order." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/track-order" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    reference: typeof search.reference === "string" ? search.reference : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  loader: async ({ location }) => {
    const reference = typeof location.search?.reference === "string" ? location.search.reference : "";
    const email = typeof location.search?.email === "string" ? location.search.email : "";
    return fetchTrackOrder(reference, email);
  },
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const data = Route.useLoaderData() as TrackOrderDetails | null;
  const navigate = useNavigate();
  const [reference, setReference] = useState(data?.reference ?? "");
  const [email, setEmail] = useState(data?.email ?? "");

  const submitTracking = () => {
    navigate({
      to: "/track-order",
      search: {
        reference: reference.trim(),
        email: email.trim(),
      },
    });
  };

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="Order support" title="Track your order" description="Enter your order reference to follow your beachwear delivery." />
        <div className="edge pb-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(420px,0.95fr)_minmax(320px,0.75fr)]">
            <section className="border border-border bg-background p-8 sm:p-10">
              <div className="label-caps text-xs">Order tracking</div>
              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Order reference
                  </span>
                  <input
                    name="reference"
                    value={reference}
                    placeholder="e.g. BD-12345"
                    onChange={(event) => setReference(event.target.value)}
                    className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground"
                  />
                </label>

                <label className="block">
                  <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Email address
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground"
                  />
                </label>

                <button
                  type="button"
                  onClick={submitTracking}
                  className="label-caps inline-flex h-12 w-full items-center justify-center bg-foreground px-8 text-background transition-opacity hover:opacity-90"
                >
                  <Search className="mr-2 size-4" /> Track order
                </button>
              </div>
              <div className="mt-8 text-sm text-muted-foreground">No tracking result found for that reference.</div>
            </section>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Order support" title="Track your order" description="Enter your order reference to follow your beachwear delivery." />

      <div className="edge pb-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(420px,0.95fr)_minmax(320px,0.75fr)]">
          <section className="border border-border bg-background p-8 sm:p-10">
            <div className="label-caps text-xs">Order tracking</div>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Order reference
                </span>
                <input
                  name="reference"
                  value={reference}
                  placeholder="e.g. BD-12345"
                  onChange={(event) => setReference(event.target.value)}
                  className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground"
                />
              </label>

              <label className="block">
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Email address
                </span>
                <input
                  name="email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground"
                />
              </label>

              <button
                type="button"
                onClick={submitTracking}
                className="label-caps inline-flex h-12 w-full items-center justify-center bg-foreground px-8 text-background transition-opacity hover:opacity-90"
              >
                <Search className="mr-2 size-4" /> Track order
              </button>
            </div>

            <div className="mt-10 grid gap-3 border-t border-border pt-8 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Status</span>
                <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.12em]">
                  {data.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Courier</span>
                <span>{data.courier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Estimated arrival</span>
                <span>{data.estimatedArrival}</span>
              </div>
            </div>
          </section>

          <aside className="border border-border bg-secondary p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background">
                <PackageCheck className="size-5" />
              </span>
              <div>
                <div className="label-caps text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Order {data.reference}
                </div>
                <div className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                  {data.productName}
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-muted-foreground" />
                <div>
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Dispatch
                  </div>
                  <div className="mt-1 text-sm text-foreground">{data.dispatchAt}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-muted-foreground" />
                <div>
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Destination
                  </div>
                  <div className="mt-1 text-sm text-foreground">{data.destination}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarCheck className="size-5 text-muted-foreground" />
                <div>
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Delivery window
                  </div>
                  <div className="mt-1 text-sm text-foreground">{data.deliveryWindow}</div>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Tracking steps
                </span>
                <span className="text-xs text-muted-foreground">
                  {data.trackingSteps.length ? `${data.trackingSteps.filter((step) => step.complete).length} of ${data.trackingSteps.length}` : "0 of 0"}
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {data.trackingSteps.length > 0 ? (
                  data.trackingSteps.map((step) => (
                    <div className="flex items-center gap-3" key={step.label}>
                      <span className={`size-2 rounded-full ${step.complete ? "bg-foreground" : "border border-foreground"}`} />
                      <span className={`text-sm ${step.complete ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No tracking events yet.</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
