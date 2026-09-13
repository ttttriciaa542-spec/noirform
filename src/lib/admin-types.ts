export type AdminSection =
  | "home"
  | "orders"
  | "products"
  | "customers"
  | "sales"
  | "discounts"
  | "appearance"
  | "delivery"
  | "settings"
  | "help"
  | "activity";

export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Ready for delivery"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
export type CustomerStatus = "Active" | "VIP" | "Inactive";
export type DiscountType = "Percentage" | "Fixed amount";
export type DiscountScope = "Store-wide" | "Product-specific" | "Category";

export interface ProductColor {
  name: string;
  swatch: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  originalUrl?: string;
  backgroundRemoved: boolean;
  processingAvailable: boolean;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  sku: string;
  price?: number;
  stock: number;
  imageId?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  sizes: string[];
  sizeStock: Record<string, number>;
  colors: ProductColor[];
  sku: string;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  featured: boolean;
  tags: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku?: string;
  variantId?: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  region: string;
  city: string;
  street: string;
  instructions?: string;
}

export interface PaymentInfo {
  method: "Paystack" | "Card" | "Mobile money" | "Cash on delivery" | "Bank transfer";
  transactionId?: string;
  paidAt?: string;
}

export interface AdminOrder {
  id: string;
  reference: string;
  createdAt: string;
  customer: OrderCustomer;
  customerSnapshot?: {
    fullName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  deliveryMethod: string;
  shipping: ShippingAddress;
  payment: PaymentInfo;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  createdAt: string;
  orderIds: string[];
  totalSpent: number;
  lastOrderAt?: string;
}

export interface Discount {
  id: string;
  name: string;
  code: string;
  type: DiscountType;
  amount: number;
  scope: DiscountScope;
  productId?: string;
  categoryId?: string;
  minimumAmount: number;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  customerUsageLimit?: number;
  usageCount: number;
  active: boolean;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  locations: string[];
  fee: number;
  freeThreshold?: number;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  enabled: boolean;
}

export interface DeliverySettings {
  methods: string[];
  zones: DeliveryZone[];
  pickupEnabled: boolean;
  pickupFee: number;
  pickupInstructions: string;
}

export interface AppearanceSettings {
  storeName: string;
  description: string;
  logoUrl?: string;
  faviconUrl?: string;
  homepageBannerUrl?: string;
  promotionalBanners: string[];
  featuredProductIds: string[];
  featuredCategoryIds: string[];
  homepageSections: string[];
  productDisplayStyle: "Editorial grid" | "Compact grid" | "Lookbook";
  footerInformation: string;
  socialLinks: Record<"Instagram" | "TikTok" | "WhatsApp" | "Facebook", string>;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  headingFont: string;
  bodyFont: string;
  buttonStyle: "Sharp" | "Soft" | "Pill";
  borderRadius: number;
  darkMode: boolean;
}

export interface StoreSettings {
  storeName: string;
  businessName: string;
  contactEmail: string;
  phone: string;
  currency: "GHS";
  orderPrefix: string;
  cancelWindowHours: number;
  lowStockThreshold: number;
  customerAccountsEnabled: boolean;
  guestCheckoutEnabled: boolean;
  inventoryTrackingEnabled: boolean;
  lowStockNotifications: boolean;
  orderNotifications: boolean;
  customerNotifications: boolean;
  paymentProvider: "Paystack" | "Flutterwave" | "Manual";
  paymentPublicKey: string;
  paymentSecretKey: string;
  deliverySettings: DeliverySettings;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  admin: string;
  objectType?: "Product" | "Order" | "Discount" | "Customer" | "Settings" | "Appearance" | "Delivery";
  objectId?: string;
}

export interface DashboardMetrics {
  totalSales: number;
  todaySales: number;
  monthSales: number;
  orders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledRefundedOrders: number;
  products: number;
  lowStockProducts: number;
  customers: number;
}

export interface SalesSummary {
  totalRevenue: number;
  netSales: number;
  orders: number;
  averageOrderValue: number;
  productsSold: number;
  byDate: Array<{ date: string; revenue: number; orders: number }>;
  byCategory: Array<{ category: string; revenue: number; units: number }>;
  bestProducts: Array<{ productId: string; name: string; units: number; revenue: number }>;
  bestCategory: string;
  bestSize: string;
  bestColor: string;
}

export interface AdminState {
  products: AdminProduct[];
  orders: AdminOrder[];
  customers: Customer[];
  discounts: Discount[];
  delivery: DeliverySettings;
  appearance: AppearanceSettings;
  settings: StoreSettings;
  activity: ActivityLog[];
  adminName: string;
}

export type AdminProductInput = Omit<
  AdminProduct,
  "id" | "slug" | "createdAt" | "updatedAt"
> & { id?: string };

export type AdminOrderInput = Omit<AdminOrder, "id" | "reference" | "createdAt"> & {
  id?: string;
  reference?: string;
  createdAt?: string;
};

export type AdminCustomerInput = Omit<Customer, "id" | "createdAt" | "orderIds" | "totalSpent"> & {
  id?: string;
  orderIds?: string[];
  totalSpent?: number;
};

export type AdminDiscountInput = Omit<Discount, "id" | "usageCount" | "createdAt"> & {
  id?: string;
  usageCount?: number;
  createdAt?: string;
};

export type AdminDeliveryZoneInput = Omit<DeliveryZone, "id"> & { id?: string };
