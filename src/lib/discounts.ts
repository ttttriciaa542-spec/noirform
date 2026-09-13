import type { AdminOrder, Discount, OrderItem } from "./admin-types";

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "-");
}

export function getDiscountPercentage(price: number, originalPrice?: number) {
  if (!originalPrice || originalPrice <= price) return null;
  const percentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  return percentage > 0 ? percentage : null;
}

export function isDiscountAvailable(discount: Discount, now = new Date()) {
  if (!discount.active) return false;
  if (discount.usageLimit != null && discount.usageCount >= discount.usageLimit) return false;
  const currentTime = now.getTime();
  if (discount.startsAt && new Date(discount.startsAt).getTime() > currentTime) return false;
  if (discount.endsAt && new Date(discount.endsAt).getTime() < currentTime) return false;
  return true;
}

export function calculateDiscountAmount(
  discount: Discount,
  subtotal: number,
  options: { productId?: string; categoryId?: string } = {},
) {
  if (!isDiscountAvailable(discount) || subtotal < discount.minimumAmount) return 0;
  if (discount.scope === "Product-specific" && options.productId && discount.productId !== options.productId) {
    return 0;
  }
  if (discount.scope === "Category" && options.categoryId && discount.categoryId !== options.categoryId) {
    return 0;
  }
  if (discount.type === "Percentage") {
    return Math.min(subtotal, subtotal * (discount.amount / 100));
  }
  return Math.min(subtotal, discount.amount);
}

export function calculateOrderTotals(
  items: OrderItem[],
  shippingFee: number,
  discount?: Discount,
) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discount ? calculateDiscountAmount(discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  return { subtotal, discountAmount, shippingFee, total };
}

export function calculateOrderFromInput(
  items: OrderItem[],
  shippingFee: number,
  discount?: Discount,
) {
  const totals = calculateOrderTotals(items, shippingFee, discount);
  return {
    ...totals,
    items,
    paymentStatus: "Pending" as const,
    status: "Pending" as const,
  };
}

export function discountDisplayName(discount: Discount) {
  return discount.type === "Percentage" ? `${discount.amount}% off` : `GH₵ ${discount.amount.toFixed(2)} off`;
}

export function findBestDiscount(
  discounts: Discount[],
  subtotal: number,
  options: { productId?: string; categoryId?: string } = {},
) {
  let best: Discount | undefined;
  let bestAmount = 0;
  for (const discount of discounts) {
    const amount = calculateDiscountAmount(discount, subtotal, options);
    if (amount > bestAmount) {
      best = discount;
      bestAmount = amount;
    }
  }
  return best ? { discount: best, amount: bestAmount } : undefined;
}

export function applyDiscountToOrder(order: AdminOrder, discount?: Discount) {
  const totals = calculateOrderTotals(order.items, order.shippingFee, discount);
  return {
    ...order,
    ...totals,
    discount: totals.discountAmount,
    total: totals.total,
  };
}
