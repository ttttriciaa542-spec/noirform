/**
 * Storefront data access layer.
 *
 * Every screen reads the catalogue through these functions. They are async on
 * purpose: replacing the mock source below with `fetch(`${API_URL}/products`)`
 * against the real backend requires no changes anywhere else.
 */
import { mockCategories, mockCollections, mockProducts } from "@/data/mock-catalog";
import { isOnSale } from "@/lib/pricing";
import type { Category, Collection, Product, ProductQuery } from "@/lib/types";

/** Base URL of the future backend API. Read from env, never hardcoded. */
export const API_BASE_URL: string | undefined = import.meta.env["VITE_API_URL"];

function matches(product: Product, query: ProductQuery): boolean {
  if (query.category && product.category !== query.category) return false;
  if (query.collection && !product.collections.includes(query.collection)) return false;
  if (query.isNew && !product.isNew) return false;
  if (query.isBestSeller && !product.isBestSeller) return false;
  if (query.onSale && !isOnSale(product.price, product.originalPrice)) return false;
  if (query.inStockOnly && product.stock <= 0) return false;
  if (query.minPrice != null && product.price < query.minPrice) return false;
  if (query.maxPrice != null && product.price > query.maxPrice) return false;
  if (query.sizes?.length && !query.sizes.some((s) => product.sizes.includes(s))) return false;
  if (query.colors?.length && !query.colors.some((c) => product.colors.some((pc) => pc.name === c)))
    return false;
  if (query.search) {
    const term = query.search.trim().toLowerCase();
    const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  return true;
}

function sortProducts(products: Product[], sort: ProductQuery["sort"]): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "best-selling":
      return list.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    default:
      return list.sort(
        (a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)),
      );
  }
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const filtered = mockProducts.filter((p) => matches(p, query));
  const sorted = sortProducts(filtered, query.sort);
  return query.limit ? sorted.slice(0, query.limit) : sorted;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  return mockProducts.find((p) => p.slug === slug) ?? null;
}

export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return mockProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(mockProducts.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, limit);
}

export async function fetchCategories(): Promise<Category[]> {
  return mockCategories;
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  return mockCategories.find((c) => c.slug === slug) ?? null;
}

export async function fetchCollections(): Promise<Collection[]> {
  return mockCollections;
}

export async function fetchCollectionBySlug(slug: string): Promise<Collection | null> {
  return mockCollections.find((c) => c.slug === slug) ?? null;
}

/** Facets used by the filter panel. Later these come from the API. */
export async function fetchFacets(): Promise<{
  sizes: string[];
  colors: string[];
  maxPrice: number;
}> {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = Array.from(
    new Set(mockProducts.flatMap((p) => p.colors.map((c) => c.name))),
  ).sort();
  const maxPrice = Math.max(...mockProducts.map((p) => p.price));
  return { sizes, colors, maxPrice };
}

export const suggestedSearches = [
  "Bikini sets",
  "Linen dress",
  "Cover-up",
  "Two-piece",
  "Beach bag",
];
