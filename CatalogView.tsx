import { useMemo, useState } from "react";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductGrid } from "./ProductGrid";
import { isOnSale } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Product, SortKey } from "@/lib/types";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

const PAGE_SIZE = 8;

interface Facets {
  sizes: string[];
  colors: string[];
  maxPrice: number;
}

interface CatalogViewProps {
  products: Product[];
  facets: Facets;
  categories?: { name: string; slug: string }[];
  /** Hide the category filter on pages already scoped to one category. */
  showCategoryFilter?: boolean;
}

interface FilterState {
  categories: string[];
  sizes: string[];
  colors: string[];
  maxPrice: number | null;
  onSale: boolean;
  inStockOnly: boolean;
}

const emptyFilters: FilterState = {
  categories: [],
  sizes: [],
  colors: [],
  maxPrice: null,
  onSale: false,
  inStockOnly: false,
};

export function CatalogView({
  products,
  facets,
  categories = [],
  showCategoryFilter = true,
}: CatalogViewProps) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.sizes.length && !filters.sizes.some((s) => p.sizes.includes(s))) return false;
      if (filters.colors.length && !filters.colors.some((c) => p.colors.some((pc) => pc.name === c)))
        return false;
      if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
      if (filters.onSale && !isOnSale(p.price, p.originalPrice)) return false;
      if (filters.inStockOnly && p.stock <= 0) return false;
      return true;
    });

    switch (sort) {
      case "newest":
        return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "best-selling":
        return [...list].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
      default:
        return [...list].sort(
          (a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)),
        );
    }
  }, [products, filters, sort]);

  const activeCount =
    filters.categories.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.maxPrice != null ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  function toggle(key: "categories" | "sizes" | "colors", value: string) {
    setVisible(PAGE_SIZE);
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }

  const panel = (
    <div className="space-y-8">
      {showCategoryFilter && categories.length ? (
        <FilterGroup title="Category">
          <div className="space-y-2.5">
            {categories.map((category) => (
              <Checkbox
                key={category.slug}
                label={category.name}
                checked={filters.categories.includes(category.slug)}
                onChange={() => toggle("categories", category.slug)}
              />
            ))}
          </div>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={filters.sizes.includes(size)}
              onClick={() => toggle("sizes", size)}
              className={cn(
                "min-w-11 border px-3 py-2 text-sm transition-colors",
                filters.sizes.includes(size)
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="space-y-2.5">
          {facets.colors.map((color) => (
            <Checkbox
              key={color}
              label={color}
              checked={filters.colors.includes(color)}
              onChange={() => toggle("colors", color)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <label htmlFor="max-price" className="sr-only">
          Maximum price
        </label>
        <input
          id="max-price"
          type="range"
          min={100}
          max={facets.maxPrice}
          step={50}
          value={filters.maxPrice ?? facets.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-[var(--color-accent)]"
        />
        <p className="mt-2 text-sm text-muted-foreground tabular-nums">
          Up to GH₵ {(filters.maxPrice ?? facets.maxPrice).toLocaleString("en-GH")}
        </p>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-2.5">
          <Checkbox
            label="In stock only"
            checked={filters.inStockOnly}
            onChange={() => setFilters((p) => ({ ...p, inStockOnly: !p.inStockOnly }))}
          />
          <Checkbox
            label="On sale"
            checked={filters.onSale}
            onChange={() => setFilters((p) => ({ ...p, onSale: !p.onSale }))}
          />
        </div>
      </FilterGroup>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={() => setFilters(emptyFilters)}
          className="label-caps text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="edge pb-20">
      <div className="flex items-center justify-between gap-4 border-y border-border py-3">
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="label-caps inline-flex items-center gap-2 lg:invisible"
        >
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          Filters
          {activeCount ? <span className="text-accent">({activeCount})</span> : null}
        </button>
        <p className="hidden text-sm text-muted-foreground lg:block">
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="label-caps hidden text-muted-foreground sm:block">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="label-caps border-0 bg-transparent py-1 pr-6 focus:outline-none"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-10 pt-10 lg:grid-cols-[220px_1fr] lg:gap-12">
        <aside className="hidden lg:block">{panel}</aside>

        <div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Nothing matches those filters"
              description="Try removing a filter or two — the piece you want may be close by."
              actionLabel="Clear filters"
              onAction={() => setFilters(emptyFilters)}
            />
          ) : (
            <>
              <ProductGrid products={filtered.slice(0, visible)} />
              {visible < filtered.length ? (
                <div className="mt-14 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="label-caps h-12 border border-foreground px-10 transition-colors hover:bg-foreground hover:text-background"
                  >
                    Load more
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          panelOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!panelOpen}
      >
        <div
          onClick={() => setPanelOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/50 transition-opacity duration-300",
            panelOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-background transition-transform duration-300 ease-out",
            panelOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="label-caps">Filters</h2>
            <button type="button" aria-label="Close filters" onClick={() => setPanelOpen(false)}>
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{panel}</div>
          <div className="border-t border-border p-5">
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="label-caps h-12 w-full bg-primary text-primary-foreground"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label-caps mb-3 text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}
