/**
 * Storefront data access layer.
 *
 * The UI should talk to a backend/API. This module is the public boundary and
 * supports a real server endpoint while keeping the frontend design unchanged.
 */
import { mockCategories, mockCollections, mockProducts } from "@/data/mock-catalog";
import { getCategoryFallbackImage, getProductFallbackImage } from "@/lib/catalog-images";
import { isOnSale } from "@/lib/pricing";
import type { Category, Collection, Product, ProductQuery, TrackOrderDetails } from "@/lib/types";

/** Base URL of the live backend API. Read from runtime env when available. */
const getRuntimeEnv = (): Record<string, string | undefined> => {
  if (typeof window === "undefined") return {};
  return (window as Window & { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ ?? {};
};

export const API_BASE_URL: string | undefined = getRuntimeEnv().VITE_API_URL ?? "/api";
const USE_MOCK_DATA = getRuntimeEnv().VITE_USE_MOCK_DATA === "true";

function withProductImageFallback(product: Product): Product {
  const images = product.images?.length
    ? product.images.map((image, index) => ({
        ...image,
        url: image.url || getProductFallbackImage(product.id, index),
      }))
    : [0, 1].map((index) => ({
        id: `${product.id}-fallback-${index}`,
        url: getProductFallbackImage(product.id, index),
        alt: `${product.name} — view ${index + 1}`,
        width: 1024,
        height: 1280,
      }));

  return { ...product, images };
}

function withCategoryImageFallback(category: Category): Category {
  return { ...category, image: category.image || getCategoryFallbackImage(category.slug) };
}

async function requestJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

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

function sortProducts(products: Product[], sort?: ProductQuery["sort"]): Product[] {
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
      return list.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
  }
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.collection) params.set("collection", query.collection);
  if (query.search) params.set("search", query.search);
  if (query.sort) params.set("sort", query.sort);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.onSale) params.set("onSale", "true");
  if (query.inStockOnly) params.set("inStockOnly", "true");
  if (query.isNew) params.set("isNew", "true");
  if (query.isBestSeller) params.set("isBestSeller", "true");

  const data = await requestJson<Product[]>(`/products?${params.toString()}`);
  if (data && data.length) return data.map(withProductImageFallback);
  if (USE_MOCK_DATA) {
    const filtered = mockProducts.filter((product) => matches(product, query));
    const sorted = sortProducts(filtered, query.sort);
    return query.limit ? sorted.slice(0, query.limit) : sorted;
  }
  return [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const data = await requestJson<Product>(`/products/${encodeURIComponent(slug)}`);
  if (data) return withProductImageFallback(data);
  if (USE_MOCK_DATA) return mockProducts.find((product) => product.slug === slug) ?? null;
  return null;
}

export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const data = await requestJson<Product[]>(`/products/${encodeURIComponent(product.slug)}/related?limit=${limit}`);
  if (data && data.length) return data.map(withProductImageFallback);
  if (!USE_MOCK_DATA) return [];

  return mockProducts
    .filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
    .concat(mockProducts.filter((candidate) => candidate.id !== product.id && candidate.category !== product.category))
    .slice(0, limit);
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await requestJson<Category[]>(`/categories`);
  return data?.map(withCategoryImageFallback) ?? (USE_MOCK_DATA ? mockCategories : []);
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const data = await requestJson<Category>(`/categories/${encodeURIComponent(slug)}`);
  if (data) return withCategoryImageFallback(data);
  if (USE_MOCK_DATA) return mockCategories.find((category) => category.slug === slug) ?? null;
  return null;
}

export async function fetchCollections(): Promise<Collection[]> {
  const data = await requestJson<Collection[]>(`/collections`);
  return data ?? (USE_MOCK_DATA ? mockCollections : []);
}

export async function fetchCollectionBySlug(slug: string): Promise<Collection | null> {
  const data = await requestJson<Collection>(`/collections/${encodeURIComponent(slug)}`);
  if (data) return data;
  if (USE_MOCK_DATA) return mockCollections.find((collection) => collection.slug === slug) ?? null;
  return null;
}

export async function fetchTrackOrder(reference = "", email = ""): Promise<TrackOrderDetails | null> {
  const params = new URLSearchParams();
  if (reference) params.set("reference", reference);
  if (email) params.set("email", email);

  const data = await requestJson<TrackOrderDetails>(`/orders/track?${params.toString()}`);
  if (data) return data;

  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("bdc.admin.orders.v1");
    if (!raw) return null;

    const orders = JSON.parse(raw) as Array<Record<string, any>>;
    const normalizedReference = reference.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const match = orders.find((order) => {
      const storedReference = String(order.reference ?? "").trim().toLowerCase();
      const storedEmail = String(order.customerSnapshot?.email ?? order.customer?.email ?? "").trim().toLowerCase();
      if (!normalizedReference) return false;
      const refMatches = storedReference === normalizedReference;
      const emailMatches = normalizedEmail ? storedEmail === normalizedEmail : true;
      return refMatches && emailMatches;
    });

    const fallbackOrder = match ?? orders.find((order) => {
      const storedReference = String(order.reference ?? "").trim().toLowerCase();
      return storedReference === normalizedReference;
    });

    if (!fallbackOrder) return null;

    const orderStatus = String(fallbackOrder.status ?? "Pending");
    const trackingSteps = [
      { label: "Order placed", complete: true },
      { label: "Email confirmation sent", complete: true },
      { label: "Packed and dispatched", complete: ["Confirmed", "Processing", "Shipped", "Delivered"].includes(orderStatus) },
      { label: "Out for delivery", complete: ["Shipped", "Delivered"].includes(orderStatus) },
      { label: "Delivered", complete: orderStatus === "Delivered" },
    ];

    return {
      reference: String(fallbackOrder.reference ?? ""),
      email: String(fallbackOrder.customerSnapshot?.email ?? fallbackOrder.customer?.email ?? ""),
      productName: fallbackOrder.items?.[0]?.name ?? "Bikini order",
      status: orderStatus,
      courier: "BigDot delivery",
      estimatedArrival: "3-5 business days",
      destination: [fallbackOrder.shipping?.city, fallbackOrder.shipping?.region].filter(Boolean).join(", ") || "Delivery destination pending",
      dispatchAt: fallbackOrder.createdAt ? new Date(fallbackOrder.createdAt).toLocaleDateString() : "Within 24 hours",
      deliveryWindow: "3-5 business days",
      trackingSteps,
    };
  } catch {
    return null;
  }
}

/** Facets used by the filter panel. These are returned by the API in production. */
export async function fetchFacets(): Promise<{
  sizes: string[];
  colors: string[];
  maxPrice: number;
}> {
  const data = await requestJson<{ sizes: string[]; colors: string[]; maxPrice: number }>(`/facets`);
  if (data) return data;

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = Array.from(new Set(mockProducts.flatMap((product) => product.colors.map((color) => color.name)))).sort();
  const maxPrice = Math.max(...mockProducts.map((product) => product.price));
  return { sizes, colors, maxPrice };
}

export const suggestedSearches = [
  "Bikini sets",
  "Linen dress",
  "Cover-up",
  "Two-piece",
  "Beach bag",
];
