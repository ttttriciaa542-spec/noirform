/**
 * Storefront domain types.
 *
 * These mirror the shape a real backend (PostgreSQL + REST/GraphQL API) is
 * expected to return. Nothing in the UI reads mock data directly — everything
 * goes through `src/lib/api.ts`, so swapping the mock source for real HTTP
 * calls requires no component changes.
 */

export interface ProductImage {
  id: string;
  /** Absolute or bundled URL. Later: Cloudflare R2 public URL. */
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductColor {
  name: string;
  /** CSS color used only for the swatch dot. */
  swatch: string;
}

export interface ProductDetails {
  material?: string;
  care?: string;
  fit?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Current selling price, in the store currency (GHS). */
  price: number;
  /** Was-price. When greater than `price`, the UI derives the discount. */
  originalPrice?: number;
  images: ProductImage[];
  /** Category slug, see `Category`. */
  category: string;
  /** Collection slugs this product belongs to. */
  collections: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
  details?: ProductDetails;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "best-selling";

export interface ProductQuery {
  category?: string;
  collection?: string;
  search?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStockOnly?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  sort?: SortKey;
  limit?: number;
}

export interface CartLine {
  /** Stable line key: productId + size + color. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  size: string;
  color: string;
  quantity: number;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  region: string;
  city: string;
  street: string;
  instructions?: string;
  isDefault?: boolean;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Order {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  items: CartLine[];
}
