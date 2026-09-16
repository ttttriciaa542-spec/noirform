/**
 * TEMPORARY mock catalogue — for visual development only.
 *
 * Delete this file once the real backend is connected; `src/lib/api.ts` is the
 * only module that imports it.
 */
import type { Category, Collection, Product } from "@/lib/types";

import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import editorial from "@/assets/editorial.jpg";
import heroMobile from "@/assets/hero-mobile.jpg";
import product01 from "@/assets/product-01.jpg";
import product02 from "@/assets/product-02.jpg";
import product03 from "@/assets/product-03.jpg";
import product04 from "@/assets/product-04.jpg";
import product05 from "@/assets/product-05.jpg";
import product06 from "@/assets/product-06.jpg";
import product07 from "@/assets/product-07.jpg";
import product08 from "@/assets/product-08.jpg";
import product09 from "@/assets/product-09.jpg";
import product10 from "@/assets/product-10.jpg";
import product11 from "@/assets/product-11.jpg";
import product12 from "@/assets/product-12.jpg";
import product13 from "@/assets/product-13.jpg";
import product14 from "@/assets/product-14.jpg";
import product15 from "@/assets/product-15.jpg";
import product16 from "@/assets/product-16.jpg";
import product17 from "@/assets/product-17.jpg";
import product18 from "@/assets/product-18.jpg";
import product19 from "@/assets/product-19.jpg";
import product20 from "@/assets/product-20.jpg";
import product21 from "@/assets/product-21.jpg";
import product22 from "@/assets/product-22.jpg";
import product23 from "@/assets/product-23.jpg";
import product24 from "@/assets/product-24.jpg";
import product25 from "@/assets/product-25.jpg";
import product26 from "@/assets/product-26.jpg";
import product27 from "@/assets/product-27.jpg";
import product28 from "@/assets/product-28.jpg";
import product29 from "@/assets/product-29.jpg";

const shots = { p1, p2, p3, p4, p5, p6, p7, p8, editorial, heroMobile };
const uniqueProductPhotos = [
  product01, product02, product03, product04, product05, product06, product07, product08,
  product09, product10, product11, product12, product13, product14, product15, product16,
  product17, product18, product19, product20, product21, product22, product23, product24,
  product25, product26, product27, product28, product29, p1, p2, p3,
];

export const mockCategories: Category[] = [
  {
    id: "c1",
    name: "Bikinis",
    slug: "bikinis",
    description: "Two-piece shapes cut to flatter, in tonal shades built for the sun.",
    image: shots.p1,
  },
  {
    id: "c2",
    name: "Swimwear",
    slug: "swimwear",
    description: "One-pieces and swim sets designed for water and everything after it.",
    image: shots.p3,
  },
  {
    id: "c3",
    name: "Dresses",
    slug: "dresses",
    description: "From slip minis to long linen — dresses that carry the whole day.",
    image: shots.p5,
  },
  {
    id: "c4",
    name: "Tops",
    slug: "tops",
    description: "Knits, crops and clean lines to build the rest of the look around.",
    image: shots.p6,
  },
  {
    id: "c5",
    name: "Bottoms",
    slug: "bottoms",
    description: "Relaxed trousers, skirts and shorts in warm, wearable neutrals.",
    image: shots.p7,
  },
  {
    id: "c6",
    name: "Sets",
    slug: "sets",
    description: "Matched pieces, one decision. Wear together or break them apart.",
    image: shots.p2,
  },
  {
    id: "c7",
    name: "Beachwear",
    slug: "beachwear",
    description: "Cover-ups and easy layers for sand, boat days and long evenings.",
    image: shots.p1,
  },
  {
    id: "c8",
    name: "Accessories",
    slug: "accessories",
    description: "Bags, shades and small pieces that finish the look.",
    image: shots.p8,
  },
];

export const mockCollections: Collection[] = [
  {
    id: "col1",
    name: "The Summer Edit",
    slug: "summer-edit",
    tagline: "Pieces made for sun-soaked days.",
    description:
      "Warm neutrals, easy shapes and fabric that moves. The edit we keep coming back to.",
    image: shots.editorial,
  },
  {
    id: "col2",
    name: "Vacation Mode",
    slug: "vacation-mode",
    tagline: "Packed in five minutes. Worn all week.",
    description: "A short list of pieces that work from the airport to the last night out.",
    image: shots.heroMobile,
  },
  {
    id: "col3",
    name: "Beach Club",
    slug: "beach-club",
    tagline: "Water, sand, and somewhere to be after.",
    description: "Swim and cover-ups styled to be seen, not just swum in.",
    image: shots.campaign,
  },
  {
    id: "col4",
    name: "Night Out",
    slug: "night-out",
    tagline: "Black, sharp, done.",
    description: "The pieces you reach for when plans change late.",
    image: shots.p4,
  },
];

type Seed = Omit<Product, "images"> & { shots: (keyof typeof shots)[] };

const seeds: Seed[] = [
  {
    id: "1",
    name: "Sunset Bikini Set",
    slug: "sunset-bikini-set",
    description:
      "A ribbed two-piece in a deep sunset clay. Fully lined, with adjustable ties and a high-cut leg.",
    price: 320,
    originalPrice: 400,
    category: "bikinis",
    collections: ["summer-edit", "beach-club"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Clay", swatch: "#b8532c" },
      { name: "Cocoa", swatch: "#5c3a2e" },
    ],
    stock: 14,
    rating: 4.8,
    reviews: 32,
    isNew: true,
    isFeatured: true,
    isBestSeller: true,
    createdAt: "2026-08-20",
    details: {
      material: "82% recycled nylon, 18% elastane. Fully lined.",
      care: "Rinse in cold water after wear. Wash by hand, dry flat, away from direct sun.",
      fit: "True to size. Model wears a size S.",
    },
    shots: ["p1", "p3"],
  },
  {
    id: "2",
    name: "Cocoa Two-Piece",
    slug: "cocoa-two-piece",
    description:
      "Ribbed cocoa set with a square-neck top and relaxed matching bottoms. Wear it as a set or split it.",
    price: 450,
    category: "sets",
    collections: ["summer-edit", "vacation-mode"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Cocoa", swatch: "#5c3a2e" },
      { name: "Sand", swatch: "#d8c3a5" },
    ],
    stock: 9,
    rating: 4.6,
    reviews: 18,
    isNew: true,
    isFeatured: true,
    createdAt: "2026-08-18",
    details: {
      material: "Ribbed cotton blend with a soft stretch.",
      care: "Machine wash cold on a gentle cycle. Do not tumble dry.",
      fit: "Relaxed through the hip.",
    },
    shots: ["p2", "p7"],
  },
  {
    id: "3",
    name: "Island Breeze Swim Set",
    slug: "island-breeze-swim-set",
    description: "Soft textured swim set in a cool sage. Light, quick-drying and easy to layer.",
    price: 380,
    originalPrice: 480,
    category: "swimwear",
    collections: ["beach-club", "summer-edit"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Sage", swatch: "#a9bfae" },
      { name: "Cream", swatch: "#efe6d6" },
    ],
    stock: 6,
    rating: 4.7,
    reviews: 24,
    isBestSeller: true,
    createdAt: "2026-08-02",
    details: {
      material: "Textured terry-touch swim jersey.",
      care: "Rinse after each wear. Dry flat in the shade.",
      fit: "Slightly cropped. Size up for extra length.",
    },
    shots: ["p3", "p1"],
  },
  {
    id: "4",
    name: "Midnight Mini Dress",
    slug: "midnight-mini-dress",
    description: "A clean black slip mini with a v-neck and fine straps. Weightless, never sheer.",
    price: 520,
    category: "dresses",
    collections: ["night-out"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Black", swatch: "#161616" }],
    stock: 11,
    rating: 4.9,
    reviews: 41,
    isFeatured: true,
    isBestSeller: true,
    createdAt: "2026-07-28",
    details: {
      material: "Matte stretch crepe with a smooth handfeel.",
      care: "Hand wash cold or dry clean.",
      fit: "Close to the body. Take your usual size.",
    },
    shots: ["p4", "p6"],
  },
  {
    id: "5",
    name: "Coastline Linen Dress",
    slug: "coastline-linen-dress",
    description: "Long cream linen dress with a soft v-neck and gathered sleeve. Made to breathe.",
    price: 600,
    originalPrice: 750,
    category: "dresses",
    collections: ["summer-edit", "vacation-mode"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Cream", swatch: "#efe6d6" },
      { name: "Sand", swatch: "#d8c3a5" },
    ],
    stock: 8,
    rating: 4.8,
    reviews: 27,
    isNew: true,
    createdAt: "2026-08-24",
    details: {
      material: "100% washed linen.",
      care: "Machine wash cold. Warm iron while slightly damp.",
      fit: "Easy fit with a defined waist seam.",
    },
    shots: ["p5", "heroMobile"],
  },
  {
    id: "6",
    name: "Sandstone Knit Top",
    slug: "sandstone-knit-top",
    description: "A cropped knit vest in speckled sandstone. Ribbed hem, clean neckline.",
    price: 250,
    category: "tops",
    collections: ["summer-edit"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Sandstone", swatch: "#cbb69c" },
      { name: "Black", swatch: "#161616" },
    ],
    stock: 21,
    rating: 4.5,
    reviews: 12,
    isNew: true,
    createdAt: "2026-08-22",
    details: {
      material: "Cotton-linen knit.",
      care: "Hand wash cold, reshape and dry flat.",
      fit: "Cropped. Size up for a longer line.",
    },
    shots: ["p6", "p2"],
  },
  {
    id: "7",
    name: "Dune Wide-Leg Trousers",
    slug: "dune-wide-leg-trousers",
    description: "High-waisted linen trousers with a pleated front and a generous leg.",
    price: 430,
    originalPrice: 520,
    category: "bottoms",
    collections: ["vacation-mode"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Dune", swatch: "#cdbda6" },
      { name: "Charcoal", swatch: "#3a3a38" },
    ],
    stock: 0,
    rating: 4.4,
    reviews: 9,
    createdAt: "2026-07-14",
    details: {
      material: "Mid-weight linen blend.",
      care: "Machine wash cold. Line dry.",
      fit: "High rise, wide leg, full length.",
    },
    shots: ["p7", "p5"],
  },
  {
    id: "8",
    name: "Raffia Beach Bag",
    slug: "raffia-beach-bag",
    description: "Hand-woven raffia tote with a lined interior. Roomy enough for the whole day.",
    price: 290,
    category: "accessories",
    collections: ["beach-club", "vacation-mode"],
    sizes: ["One size"],
    colors: [{ name: "Natural", swatch: "#e0cba8" }],
    stock: 17,
    rating: 4.7,
    reviews: 15,
    isBestSeller: true,
    createdAt: "2026-08-10",
    details: {
      material: "Woven raffia with a cotton lining.",
      care: "Spot clean only. Store flat.",
      fit: "38cm wide, 34cm tall.",
    },
    shots: ["p8", "p3"],
  },
  {
    id: "9",
    name: "Ocean Blue Swim Set",
    slug: "ocean-blue-swim-set",
    description: "A sculpted swim set with clean seams and a supportive band.",
    price: 350,
    category: "swimwear",
    collections: ["beach-club"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Sage", swatch: "#a9bfae" },
      { name: "Clay", swatch: "#b8532c" },
    ],
    stock: 12,
    rating: 4.6,
    reviews: 20,
    createdAt: "2026-07-30",
    details: {
      material: "Recycled swim jersey with UPF 50+.",
      care: "Rinse after wear. Dry flat.",
      fit: "Supportive. True to size.",
    },
    shots: ["p3", "p8"],
  },
  {
    id: "10",
    name: "Soft Ribbed Set",
    slug: "soft-ribbed-set",
    description: "A relaxed ribbed lounge set that travels well and creases less.",
    price: 470,
    originalPrice: 560,
    category: "sets",
    collections: ["vacation-mode", "summer-edit"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Cocoa", swatch: "#5c3a2e" },
      { name: "Sandstone", swatch: "#cbb69c" },
    ],
    stock: 5,
    rating: 4.5,
    reviews: 11,
    isBestSeller: true,
    createdAt: "2026-08-06",
    details: {
      material: "Ribbed viscose blend.",
      care: "Machine wash cold, gentle cycle.",
      fit: "Relaxed. Size down for a closer fit.",
    },
    shots: ["p2", "p6"],
  },
  {
    id: "11",
    name: "Shoreline Cover-Up",
    slug: "shoreline-cover-up",
    description: "A long, airy cover-up that ties at the waist. Throw it over anything.",
    price: 390,
    category: "beachwear",
    collections: ["beach-club", "summer-edit"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Sand", swatch: "#d8c3a5" }],
    stock: 10,
    rating: 4.6,
    reviews: 14,
    isNew: true,
    isFeatured: true,
    createdAt: "2026-08-26",
    details: {
      material: "Lightweight washed cotton gauze.",
      care: "Machine wash cold. Line dry.",
      fit: "Oversized by design.",
    },
    shots: ["heroMobile", "p5"],
  },
  {
    id: "12",
    name: "Terracotta One-Piece",
    slug: "terracotta-one-piece",
    description: "A ribbed one-piece with a scoop back and clean, high-cut lines.",
    price: 400,
    originalPrice: 500,
    category: "swimwear",
    collections: ["beach-club", "summer-edit"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Terracotta", swatch: "#b8532c" }],
    stock: 7,
    rating: 4.9,
    reviews: 36,
    isBestSeller: true,
    isFeatured: true,
    createdAt: "2026-08-14",
    details: {
      material: "Ribbed recycled nylon, fully lined.",
      care: "Rinse after wear. Dry flat in the shade.",
      fit: "High-cut leg. True to size.",
    },
    shots: ["p1", "p2"],
  },
  {
    id: "13",
    name: "Harmattan Knit Crop",
    slug: "harmattan-knit-crop",
    description: "A soft cropped knit with a wide rib and a rounded neck.",
    price: 260,
    originalPrice: 320,
    category: "tops",
    collections: ["night-out"],
    sizes: ["XS", "S", "M", "L"],
    colors: [{ name: "Oat", swatch: "#ddcdb4" }],
    stock: 19,
    rating: 4.3,
    reviews: 8,
    createdAt: "2026-07-08",
    details: {
      material: "Cotton knit.",
      care: "Hand wash cold, dry flat.",
      fit: "Cropped, close fit.",
    },
    shots: ["p6", "p4"],
  },
  {
    id: "14",
    name: "Accra Linen Shorts",
    slug: "accra-linen-shorts",
    description: "Pull-on linen shorts with a soft waistband and a clean, tailored leg.",
    price: 280,
    category: "bottoms",
    collections: ["vacation-mode"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Dune", swatch: "#cdbda6" }],
    stock: 15,
    rating: 4.4,
    reviews: 10,
    isNew: true,
    createdAt: "2026-08-21",
    details: {
      material: "Washed linen.",
      care: "Machine wash cold. Line dry.",
      fit: "Mid rise, relaxed.",
    },
    shots: ["p7", "p6"],
  },
  {
    id: "15",
    name: "Gold Hoop & Shades Set",
    slug: "gold-hoop-shades-set",
    description: "Tortoise-shell shades with a pair of slim gold hoops. Sold together.",
    price: 220,
    originalPrice: 300,
    category: "accessories",
    collections: ["night-out", "vacation-mode"],
    sizes: ["One size"],
    colors: [{ name: "Tortoise", swatch: "#8a5a2b" }],
    stock: 24,
    rating: 4.5,
    reviews: 7,
    createdAt: "2026-08-01",
    details: {
      material: "Acetate frames, gold-plated brass hoops.",
      care: "Store in the pouch provided.",
      fit: "One size.",
    },
    shots: ["p8", "p1"],
  },
  {
    id: "16",
    name: "Palm Shadow Bikini",
    slug: "palm-shadow-bikini",
    description: "A minimal triangle bikini with sliding ties for a fit you set yourself.",
    price: 300,
    category: "bikinis",
    collections: ["beach-club"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", swatch: "#161616" },
      { name: "Clay", swatch: "#b8532c" },
    ],
    stock: 13,
    rating: 4.6,
    reviews: 17,
    isNew: true,
    createdAt: "2026-08-25",
    details: {
      material: "Recycled nylon blend, fully lined.",
      care: "Rinse after wear. Dry flat.",
      fit: "Adjustable at the neck and hip.",
    },
    shots: ["p1", "p4"],
  },
];

export const mockProducts: Product[] = seeds.map(({ shots: _keys, ...rest }) => ({
  ...rest,
  images: [0, 1].map((index) => {
    const photo = uniqueProductPhotos[(Number(rest.id) - 1) * 2 + index];
    return {
      id: `${rest.id}-${index}`,
      url: photo,
      alt: `${rest.name} — view ${index + 1}`,
      width: 1024,
      height: 1280,
    };
  }),
}));
