import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Check, ChevronRight, Minus, Plus, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { PriceDisplay } from "@/components/shop/PriceDisplay";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { SizeGuide } from "@/components/shop/SizeGuide";
import { ProductRail } from "@/components/shop/ProductGrid";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    const related = await fetchRelatedProducts(product, 8);
    return { product, related };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product not found — BigDotCollections" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — BigDotCollections`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "GHS",
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const { addToCart, setCartOpen } = useShop();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const [openDetail, setOpenDetail] = useState<string | null>("details");

  const soldOut = product.stock <= 0;

  const handleAdd = () => {
    if (!size) {
      toast.error("Choose a size first");
      return;
    }
    addToCart(product, { size, color, quantity });
    setCartOpen(true);
  };

  const sections = [
    {
      id: "details",
      title: "Details & fit",
      body: [product.details?.material, product.details?.fit].filter(Boolean).join(" · ") ||
        product.description,
    },
    { id: "care", title: "Care", body: product.details?.care ?? "Hand wash cold, dry flat." },
    {
      id: "delivery",
      title: "Delivery & returns",
      body: `Flat ${formatPrice(35)} delivery across Ghana, free over ${formatPrice(800)}. Returns accepted within 7 days, unworn with tags.`,
    },
  ];

  return (
    <div className="pt-16 md:pt-20">
      <nav aria-label="Breadcrumb" className="edge py-4">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3" aria-hidden="true" />
          <li>
            <Link
              to="/shop/$category"
              params={{ category: product.category }}
              className="capitalize hover:text-foreground"
            >
              {product.category.replace(/-/g, " ")}
            </Link>
          </li>
          <ChevronRight className="size-3" aria-hidden="true" />
          <li aria-current="page" className="truncate text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="edge grid gap-8 pb-16 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="display-xl text-3xl sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-4">
            <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="lg" />
            {product.rating != null && (
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)} ★ ({product.reviews ?? 0})
              </span>
            )}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {product.colors.length > 0 && (
            <div className="mt-8">
              <p className="label-caps text-[0.625rem]">
                Colour: <span className="text-muted-foreground">{color}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setColor(option.name)}
                    aria-label={option.name}
                    aria-pressed={color === option.name}
                    className={cn(
                      "grid size-9 place-items-center rounded-full border transition-colors",
                      color === option.name ? "border-foreground" : "border-border",
                    )}
                  >
                    <span
                      className="size-6 rounded-full border border-border/60"
                      style={{ backgroundColor: option.swatch }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="label-caps text-[0.625rem]">Size</p>
              <SizeGuide />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  aria-pressed={size === option}
                  className={cn(
                    "min-w-14 border px-4 py-2.5 text-sm transition-colors",
                    size === option
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <QuantitySelector value={quantity} onChange={setQuantity} max={Math.max(1, product.stock)} />
            <span className="text-xs text-muted-foreground">
              {soldOut
                ? "Out of stock"
                : product.stock <= 5
                  ? `Only ${product.stock} left`
                  : "In stock"}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              className="label-caps h-13 flex-1 bg-foreground py-4 text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {soldOut ? "Sold out" : "Add to bag"}
            </button>
            <WishlistButton
              productId={product.id}
              productName={product.name}
              className="size-13 border border-border"
            />
          </div>

          <ul className="mt-8 grid gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Truck className="size-4" aria-hidden="true" /> Nationwide delivery, flat{" "}
              {formatPrice(35)}
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="size-4" aria-hidden="true" /> 7-day returns on unworn items
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4" aria-hidden="true" /> Secure checkout
            </li>
          </ul>

          <div className="mt-8 divide-y divide-border border-y border-border">
            {sections.map((section) => {
              const open = openDetail === section.id;
              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => setOpenDetail(open ? null : section.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between py-4 text-left"
                  >
                    <span className="label-caps text-[0.625rem]">{section.title}</span>
                    {open ? (
                      <Minus className="size-4" aria-hidden="true" />
                    ) : (
                      <Plus className="size-4" aria-hidden="true" />
                    )}
                  </button>
                  {open && (
                    <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {size && (
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="size-3.5" aria-hidden="true" /> {size} · {color} selected
            </p>
          )}
        </div>
      </div>

      <section className="edge pb-20">
        <Reveal>
          <SectionHeading eyebrow="Styled with" title="You may also like" />
        </Reveal>
        <div className="mt-10">
          <ProductRail products={related} />
        </div>
      </section>
    </div>
  );
}
