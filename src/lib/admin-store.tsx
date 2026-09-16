import type {
  ActivityLog,
  AdminOrder,
  AdminProduct,
  AppearanceSettings,
  Customer,
  Discount,
  DeliveryZone,
} from "@/lib/admin-types";
import { requestJson, requestJsonOrThrow } from "@/lib/http-client";
import type { Product } from "@/lib/types";
import { mockProducts } from "@/data/mock-catalog";
import heroDesktop from "@/assets/hero-desktop.jpg";

const ADMIN_PRODUCTS_KEY = "bdc.admin.products.v1";
const ADMIN_ORDERS_KEY = "bdc.admin.orders.v1";
const ADMIN_DISCOUNTS_KEY = "bdc.admin.discounts.v1";
const ADMIN_ZONES_KEY = "bdc.admin.zones.v1";
const ADMIN_DELIVERY_METHODS_KEY = "bdc.admin.delivery.methods.v1";
const ADMIN_APPEARANCE_KEY = "bdc.admin.appearance.v1";

const readLocalJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures in private browsing or quota-limited environments
  }
};

const getRuntimeEnv = (): Record<string, string | undefined> => {
  if (typeof window === "undefined") return {};
  return (window as Window & { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ ?? {};
};

const USE_MOCK_DATA = getRuntimeEnv().VITE_USE_MOCK_DATA === "true";

const defaultAdminProducts = (): AdminProduct[] =>
  USE_MOCK_DATA ? mockProducts.map((product) => toAdminProduct(product)) : [];

const defaultAdminDiscounts = (): Discount[] => [
  {
    id: "disc-summer10",
    name: "Summer Sale",
    code: "SUMMER10",
    type: "Percentage",
    amount: 10,
    scope: "Store-wide",
    minimumAmount: 200,
    usageLimit: 100,
    customerUsageLimit: 1,
    usageCount: 12,
    active: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    startsAt: "2026-08-01T00:00:00.000Z",
    endsAt: "2026-09-30T00:00:00.000Z",
  },
  {
    id: "disc-freeship",
    name: "Free Delivery",
    code: "FREESHIP",
    type: "Fixed amount",
    amount: 30,
    scope: "Store-wide",
    minimumAmount: 300,
    usageLimit: 50,
    customerUsageLimit: 2,
    usageCount: 9,
    active: true,
    createdAt: "2026-08-15T00:00:00.000Z",
    startsAt: "2026-08-15T00:00:00.000Z",
    endsAt: "2026-10-15T00:00:00.000Z",
  },
];

const defaultAdminZones = (): DeliveryZone[] => [
  {
    id: "zone-ghana",
    name: "Ghana Mainland",
    locations: ["Greater Accra", "Ashanti", "Western", "Central", "Eastern"],
    fee: 35,
    freeThreshold: 500,
    estimatedMinDays: 3,
    estimatedMaxDays: 5,
    enabled: true,
  },
  {
    id: "zone-region",
    name: "Northern & Upper Regions",
    locations: ["Northern", "Upper East", "Upper West", "Volta", "Bono"],
    fee: 50,
    freeThreshold: 650,
    estimatedMinDays: 4,
    estimatedMaxDays: 7,
    enabled: true,
  },
];

const defaultAdminDeliveryMethods = (): any[] => [
  {
    id: "method-standard",
    name: "Standard delivery",
    description: "Delivered in 3-5 business days",
    zoneId: "zone-ghana",
    rate: 35,
    estimatedDays: { min: 3, max: 5 },
    isActive: true,
  },
  {
    id: "method-express",
    name: "Express delivery",
    description: "Priority dispatch for urgent orders",
    zoneId: "zone-ghana",
    rate: 60,
    estimatedDays: { min: 1, max: 2 },
    isActive: false,
  },
];

const defaultAppearanceSettings = (): AppearanceSettings => ({
  storeName: "BigDotCollections",
  description: "Beachwear and elevated resort pieces made for daily life",
  logoUrl: "",
  faviconUrl: "",
  homepageBannerUrl: heroDesktop,
  promotionalBanners: [],
  featuredProductIds: [],
  featuredCategoryIds: [],
  homepageSections: ["Hero", "New Arrivals", "Best Sellers"],
  productDisplayStyle: "Editorial grid",
  footerInformation: "Shipping across Ghana and selected regional delivery options.",
  socialLinks: { Instagram: "", TikTok: "", WhatsApp: "", Facebook: "" },
  primaryColor: "#3a3a38",
  secondaryColor: "#d8c3a5",
  buttonStyle: "Sharp",
  borderRadius: 14,
  darkMode: false,
  accentColor: "#b8532c",
  backgroundColor: "#f5f0e8",
  surfaceColor: "#faf8f4",
  textColor: "#2c2c2a",
  mutedTextColor: "#6b6560",
  borderColor: "#e0d9ce",
  headingFont: "Bodoni Moda",
  bodyFont: "Jost",
});

const imgUrl = (name: string) => `/assets/${name}`;

let _products: AdminProduct[] = readLocalJson(ADMIN_PRODUCTS_KEY, defaultAdminProducts());
let _categories: any[] = [];
let _collections: any[] = [];
let _customers: Customer[] = [];
let _orders: AdminOrder[] = readLocalJson(ADMIN_ORDERS_KEY, []);
let _discounts: Discount[] = readLocalJson(ADMIN_DISCOUNTS_KEY, defaultAdminDiscounts());
let _zones: DeliveryZone[] = readLocalJson(ADMIN_ZONES_KEY, defaultAdminZones());
let _deliveryMethods: any[] = readLocalJson(ADMIN_DELIVERY_METHODS_KEY, defaultAdminDeliveryMethods());
let _activityLogs: ActivityLog[] = [];
let _appearanceSettings: AppearanceSettings = readLocalJson(ADMIN_APPEARANCE_KEY, defaultAppearanceSettings());

export const adminCategories: any[] = _categories;
export const adminCollections: any[] = _collections;
export const adminCustomers: Customer[] = _customers;
export const adminOrders: AdminOrder[] = _orders;
export const adminProducts: AdminProduct[] = _products;
export const adminDiscounts: Discount[] = _discounts;
export const adminZones: DeliveryZone[] = _zones;
export const adminDeliveryMethods: any[] = _deliveryMethods;
export const adminActivityLogs: ActivityLog[] = _activityLogs;

export function addAdminProduct(product: AdminProduct): void {
  _products = [..._products, product];
  writeLocalJson(ADMIN_PRODUCTS_KEY, _products);
  void requestJsonOrThrow('/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) }).catch(() => undefined);
}

export function updateAdminProduct(product: AdminProduct): void {
  _products = _products.map((current) => (current.id === product.id ? product : current));
  writeLocalJson(ADMIN_PRODUCTS_KEY, _products);
  void requestJsonOrThrow('/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) }).catch(() => undefined);
}

export function deleteAdminProduct(id: string): void {
  _products = _products.filter((p) => p.id !== id);
  writeLocalJson(ADMIN_PRODUCTS_KEY, _products);
  void requestJsonOrThrow(`/admin/products/${id}`, { method: 'DELETE' }).catch(() => undefined);
}

export function addAdminDiscount(discount: Discount): Discount[] {
  _discounts = [discount, ..._discounts];
  writeLocalJson(ADMIN_DISCOUNTS_KEY, _discounts);
  return _discounts;
}

export function updateAdminDiscount(discount: Discount): Discount[] {
  _discounts = _discounts.map((current) => (current.id === discount.id ? discount : current));
  writeLocalJson(ADMIN_DISCOUNTS_KEY, _discounts);
  return _discounts;
}

export function deleteAdminDiscount(id: string): Discount[] {
  _discounts = _discounts.filter((discount) => discount.id !== id);
  writeLocalJson(ADMIN_DISCOUNTS_KEY, _discounts);
  return _discounts;
}

export function saveAdminZones(zones: DeliveryZone[]): DeliveryZone[] {
  _zones = zones;
  writeLocalJson(ADMIN_ZONES_KEY, _zones);
  return _zones;
}

export function saveAdminDeliveryMethods(methods: any[]): any[] {
  _deliveryMethods = methods;
  writeLocalJson(ADMIN_DELIVERY_METHODS_KEY, _deliveryMethods);
  return _deliveryMethods;
}

export function saveAdminAppearanceSettings(settings: Partial<AppearanceSettings>): AppearanceSettings {
  _appearanceSettings = { ..._appearanceSettings, ...settings };
  writeLocalJson(ADMIN_APPEARANCE_KEY, _appearanceSettings);
  return _appearanceSettings;
}

const normalizeOrderForStorage = (order: Partial<AdminOrder> & { paymentStatus?: string; status?: string }): AdminOrder => ({
  ...order,
  id: order.id ?? `ord-${Date.now()}`,
  reference: order.reference ?? `BDC-${Date.now().toString().slice(-8)}`,
  createdAt: order.createdAt ?? new Date().toISOString(),
  customer: {
    id: order.customer?.id ?? `cust-${Date.now()}`,
    name: order.customer?.name ?? order.shipping?.fullName ?? "Customer",
    email: order.customer?.email ?? order.customerSnapshot?.email ?? "",
    phone: order.customer?.phone ?? order.shipping?.phone ?? order.customerSnapshot?.phone ?? "",
  },
  customerSnapshot: order.customerSnapshot ?? {
    fullName: order.customer?.name ?? order.shipping?.fullName ?? "Customer",
    email: order.customer?.email ?? "",
    phone: order.customer?.phone ?? order.shipping?.phone ?? "",
  },
  items: order.items ?? [],
  subtotal: order.subtotal ?? 0,
  discount: order.discount ?? 0,
  shippingFee: order.shippingFee ?? 0,
  total: order.total ?? 0,
  paymentStatus: (order.paymentStatus as AdminOrder["paymentStatus"]) ?? "Pending",
  status: (order.status as AdminOrder["status"]) ?? "Pending",
  deliveryMethod: order.deliveryMethod ?? "Standard delivery",
  shipping: order.shipping ?? {
    fullName: order.customer?.name ?? "Customer",
    phone: order.customer?.phone ?? "",
    region: "",
    city: "",
    street: "",
  },
  payment: order.payment ?? {
    method: "Paystack",
    transactionId: order.reference ?? "demo",
    paidAt: new Date().toISOString(),
  },
});

const reloadOrdersFromStorage = (): AdminOrder[] => {
  const stored = readLocalJson<AdminOrder[]>(ADMIN_ORDERS_KEY, []);
  _orders = stored.map((order) => normalizeOrderForStorage(order));
  writeLocalJson(ADMIN_ORDERS_KEY, _orders);
  return _orders;
};

export function getAdminOrderByReference(reference: string): AdminOrder | undefined {
  const normalizedReference = reference.trim().toLowerCase();
  return reloadOrdersFromStorage().find(
    (order) => order.reference.trim().toLowerCase() === normalizedReference,
  );
}

export function addAdminOrder(order: AdminOrder): void {
  const normalizedOrder = normalizeOrderForStorage(order);
  _orders = [normalizedOrder, ...reloadOrdersFromStorage()];
  writeLocalJson(ADMIN_ORDERS_KEY, _orders);
  void requestJsonOrThrow('/admin/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizedOrder),
  }).catch(() => undefined);
}

export function updateAdminOrderStatus(id: string, status: AdminOrder["status"]): AdminOrder[] {
  _orders = reloadOrdersFromStorage().map((order) => {
    if (order.id !== id) return order;

    const nextPaymentStatus: AdminOrder["paymentStatus"] =
      status === "Refunded"
        ? "Refunded"
        : status === "Cancelled"
          ? "Failed"
          : "Paid";

    const nextOrder: AdminOrder = {
      ...order,
      status,
      paymentStatus: status === "Pending" ? "Pending" : nextPaymentStatus,
    };

    if (typeof window !== "undefined") {
      void requestJsonOrThrow(`/admin/orders/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).catch(() => undefined);
    }

    return nextOrder;
  });
  writeLocalJson(ADMIN_ORDERS_KEY, _orders);
  return _orders;
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  if (_products.length === 0) {
    _products = readLocalJson(ADMIN_PRODUCTS_KEY, defaultAdminProducts());
    writeLocalJson(ADMIN_PRODUCTS_KEY, _products);
  }

  const apiData = await requestJson<AdminProduct[]>(`/admin/products`, _products);
  if (Array.isArray(apiData) && apiData.length) {
    _products = apiData;
    writeLocalJson(ADMIN_PRODUCTS_KEY, _products);
  }
  return _products;
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const freshOrders = reloadOrdersFromStorage();
  const apiData = await requestJson<AdminOrder[]>(`/admin/orders`, freshOrders);
  if (Array.isArray(apiData) && apiData.length) {
    _orders = apiData.map((order) => normalizeOrderForStorage(order));
    writeLocalJson(ADMIN_ORDERS_KEY, _orders);
    return _orders;
  }
  return freshOrders;
}

export async function fetchAdminCustomers(): Promise<Customer[]> {
  return requestJson<Customer[]>(`/admin/customers`, adminCustomers);
}

export async function fetchAdminDiscounts(): Promise<Discount[]> {
  const data = await requestJson<Discount[]>(`/admin/discounts`, _discounts);
  if (Array.isArray(data) && data.length) {
    _discounts = data;
    writeLocalJson(ADMIN_DISCOUNTS_KEY, _discounts);
  }
  return _discounts;
}

export async function fetchAdminCategories(): Promise<any[]> {
  return requestJson<any[]>(`/admin/categories`, adminCategories);
}

export async function fetchAdminCollections(): Promise<any[]> {
  return requestJson<any[]>(`/admin/collections`, adminCollections);
}

export async function fetchAdminActivityLogs(): Promise<ActivityLog[]> {
  return requestJson<ActivityLog[]>(`/admin/activity-logs`, adminActivityLogs);
}

export async function fetchAdminAppearanceSettings(): Promise<AppearanceSettings> {
  const data = await requestJson<AppearanceSettings>("/admin/appearance", _appearanceSettings);
  if (data && typeof data === "object") {
    _appearanceSettings = { ..._appearanceSettings, ...data };
    writeLocalJson(ADMIN_APPEARANCE_KEY, _appearanceSettings);
  }
  return _appearanceSettings;
}

export async function fetchAdminZones(): Promise<DeliveryZone[]> {
  const data = await requestJson<DeliveryZone[]>(`/admin/zones`, _zones);
  if (Array.isArray(data) && data.length) {
    _zones = data;
    writeLocalJson(ADMIN_ZONES_KEY, _zones);
  }
  return _zones;
}

export async function fetchAdminDeliveryMethods(): Promise<any[]> {
  const data = await requestJson<any[]>(`/admin/delivery-methods`, _deliveryMethods);
  if (Array.isArray(data) && data.length) {
    _deliveryMethods = data;
    writeLocalJson(ADMIN_DELIVERY_METHODS_KEY, _deliveryMethods);
  }
  return _deliveryMethods;
}

export async function fetchAdminDashboardStats() {
  const productList = _products.length ? _products : defaultAdminProducts();
  const orderList = _orders.length ? _orders : [];
  const totalRevenue = orderList.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orderList.length;
  const totalCustomers = new Set(orderList.map((order) => order.customer.email)).size;
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const lowStockProducts = productList
    .filter((product) => {
      const sizeTotal = Object.values(product.sizeStock ?? {}).reduce((sum, stock) => sum + Number(stock || 0), 0);
      const total = sizeTotal || product.stock || 0;
      return total <= product.lowStockThreshold;
    })
    .map((product) => ({
      productId: product.id,
      productName: product.name,
      stock: Object.values(product.sizeStock ?? {}).reduce((sum, stock) => sum + Number(stock || 0), 0) || product.stock || 0,
    }));

  const ordersByStatus = {
    pending: orderList.filter((order) => order.status.toLowerCase() === "pending").length,
    confirmed: orderList.filter((order) => order.status.toLowerCase() === "confirmed").length,
    processing: orderList.filter((order) => order.status.toLowerCase() === "processing").length,
    shipped: orderList.filter((order) => order.status.toLowerCase() === "shipped").length,
    delivered: orderList.filter((order) => order.status.toLowerCase() === "delivered").length,
    cancelled: orderList.filter((order) => order.status.toLowerCase() === "cancelled").length,
    returned: orderList.filter((order) => order.status.toLowerCase() === "returned").length,
    refunded: orderList.filter((order) => order.status.toLowerCase() === "refunded").length,
  };

  const revenueByDay = Object.entries(
    orderList.reduce<Record<string, { date: string; revenue: number; orders: number }>>((acc, order) => {
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      const next = acc[date] ?? { date, revenue: 0, orders: 0 };
      next.revenue += order.total;
      next.orders += 1;
      acc[date] = next;
      return acc;
    }, {}),
  )
    .map(([, item]) => item)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  return {
    totalRevenue,
    revenueThisMonth: totalRevenue,
    revenueLastMonth: 0,
    revenueGrowthMoM: 0,
    totalOrders,
    ordersThisMonth: totalOrders,
    ordersLastMonth: 0,
    ordersGrowthMoM: 0,
    totalCustomers,
    newCustomersThisMonth: totalCustomers,
    averageOrderValue,
    averageOrderValueThisMonth: averageOrderValue,
    conversionRate: 0,
    topProducts: productList.slice(0, 5).map((product) => ({ productId: product.id, name: product.name, revenue: product.price })),
    topCategories: [],
    recentOrders: [...orderList].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5),
    lowStockProducts,
    ordersByStatus,
    revenueByDay,
  };
}

export function toAdminProduct(p: Product): AdminProduct {
  const sizeStock = p.sizes.reduce<Record<string, number>>((acc, size) => {
    acc[size] = Math.max(0, Math.round(p.stock / Math.max(p.sizes.length, 1)));
    return acc;
  }, {});

  return {
    id: p.id,
    sku: `BDC-${p.id.padStart(4, "0")}`,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    subcategory: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    images: p.images.map((img, i) => ({
      id: `${p.id}-${i}`,
      url: img.url,
      alt: img.alt,
      originalUrl: img.url,
      backgroundRemoved: false,
      processingAvailable: false,
      width: img.width,
      height: img.height,
    })),
    sizes: [...p.sizes],
    sizeStock,
    colors: p.colors.map((c) => ({ name: c.name, swatch: c.swatch })),
    stock: p.stock,
    lowStockThreshold: 3,
    status: "active",
    featured: !!p.isFeatured,
    tags: [p.category],
    variants: [],
    createdAt: p.createdAt,
    updatedAt: p.createdAt,
  };
}
