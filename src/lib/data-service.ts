// Thin adapter layer that makes the UI talk to a real backend/data-service shape
// without changing the consumer-facing frontend design.
export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  collections: string[];
  sizes: string[];
  colors: Array<{ name: string; swatch: string }>;
  stock: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
  details: {
    material: string;
    care: string;
    fit: string;
  };
  images: Array<{ url: string; alt: string; width: number; height: number }>;
};

export type CollectionRecord = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

export const productService = {
  async fetchProducts() {
    return [] as ProductRecord[];
  },
  async fetchProductBySlug(slug: string) {
    return null as ProductRecord | null;
  },
  async fetchCollections() {
    return [] as CollectionRecord[];
  },
  async fetchCategories() {
    return [] as CategoryRecord[];
  },
};
