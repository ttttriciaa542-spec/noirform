import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
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

const productPhotos = [
  product01, product02, product03, product04, product05, product06, product07, product08,
  product09, product10, product11, product12, product13, product14, product15, product16,
  product17, product18, product19, product20, product21, product22, product23, product24,
  product25, product26, product27, product28, product29, p1, p2, p3,
];
const categoryPhotos = [p1, p3, p5, p6, p7, p2, heroMobile, p8];

function stableIndex(value: string, length: number): number {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) % length;
  return hash;
}

export function getProductFallbackImage(productKey: string, imageIndex = 0): string {
  const index = (stableIndex(productKey, productPhotos.length) + imageIndex) % productPhotos.length;
  return productPhotos[index];
}

export function getCategoryFallbackImage(categoryKey: string): string {
  return categoryPhotos[stableIndex(categoryKey, categoryPhotos.length)];
}

export function getCollectionFallbackImage(collectionKey: string): string {
  return productPhotos[stableIndex(collectionKey, productPhotos.length)];
}

export function replaceBrokenImage(event: React.SyntheticEvent<HTMLImageElement>, fallback: string) {
  const image = event.currentTarget;
  if (image.src === new URL(fallback, window.location.href).href) return;
  image.onerror = null;
  image.src = fallback;
}