export const CURRENCY_SYMBOL = "GH₵";

/** Format an amount in the store currency (Ghanaian cedi). */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasDecimals = rounded % 1 !== 0;
  return `${CURRENCY_SYMBOL} ${rounded.toLocaleString("en-GH", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Derive the discount from price vs originalPrice. Never typed by hand.
 * Returns null when there is no genuine discount.
 */
export function getDiscountPercentage(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
  return pct > 0 ? pct : null;
}

export function isOnSale(price: number, originalPrice?: number): boolean {
  return getDiscountPercentage(price, originalPrice) !== null;
}
