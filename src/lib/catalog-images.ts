import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import heroMobile from "@/assets/hero-mobile.jpg";

const productPhotos = [p1, p2, p3, p4, p5, p6, p7, p8];
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