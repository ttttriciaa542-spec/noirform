-- BigDotCollections schema
-- SQLite-compatible SQL structure for the storefront, admin, orders, stock, discounts, deliveries, and activity log.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin', 'staff')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  phone TEXT,
  accepts_marketing INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  label TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  instructions TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  image_url TEXT,
  is_visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  original_price_cents INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 3,
  rating REAL NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_best_seller INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
  material TEXT,
  care TEXT,
  fit TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS product_collections (
  product_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  PRIMARY KEY(product_id, collection_id),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0,
  remove_background INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sizes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_sizes (
  product_id TEXT NOT NULL,
  size_id TEXT NOT NULL,
  sku_suffix TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 2,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(product_id, size_id),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(size_id) REFERENCES sizes(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS colors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  swatch TEXT
);

CREATE TABLE IF NOT EXISTS product_colors (
  product_id TEXT NOT NULL,
  color_id TEXT NOT NULL,
  PRIMARY KEY(product_id, color_id),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(color_id) REFERENCES colors(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed', 'free_shipping')),
  value_cents INTEGER NOT NULL DEFAULT 0,
  applies_to TEXT NOT NULL CHECK(applies_to IN ('all', 'products', 'categories', 'collections')),
  min_subtotal_cents INTEGER,
  first_order_only INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  usage_limit_per_customer INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  starts_at TEXT,
  ends_at TEXT,
  combinable INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS discount_targets (
  discount_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK(target_type IN ('product', 'category', 'collection')),
  target_id TEXT NOT NULL,
  PRIMARY KEY(discount_id, target_type, target_id),
  FOREIGN KEY(discount_id) REFERENCES discounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS delivery_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  regions TEXT NOT NULL,
  rate_cents INTEGER NOT NULL DEFAULT 0,
  free_shipping_threshold_cents INTEGER,
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  zone_id TEXT NOT NULL,
  rate_cents INTEGER NOT NULL DEFAULT 0,
  free_shipping_threshold_cents INTEGER,
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  carrier_key TEXT,
  requires_pickup_point INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(zone_id) REFERENCES delivery_zones(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS shop_settings (
  id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  tagline TEXT,
  store_email TEXT,
  store_phone TEXT,
  store_address TEXT,
  currency TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  timezone TEXT,
  maintenance_mode INTEGER NOT NULL DEFAULT 0,
  maintenance_message TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS appearance_settings (
  id TEXT PRIMARY KEY,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  surface_color TEXT,
  text_color TEXT,
  muted_text_color TEXT,
  border_color TEXT,
  heading_font TEXT,
  body_font TEXT,
  border_radius TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_settings (
  id TEXT PRIMARY KEY,
  enable_cod INTEGER NOT NULL DEFAULT 1,
  enable_mobile_money INTEGER NOT NULL DEFAULT 1,
  enable_card INTEGER NOT NULL DEFAULT 0,
  enable_bank_transfer INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_settings (
  id TEXT PRIMARY KEY,
  from_email TEXT,
  from_name TEXT,
  reply_to_email TEXT,
  enable_order_confirmation INTEGER NOT NULL DEFAULT 1,
  enable_shipping_notification INTEGER NOT NULL DEFAULT 1,
  enable_delivery_confirmation INTEGER NOT NULL DEFAULT 1,
  enable_abandoned_cart INTEGER NOT NULL DEFAULT 1,
  enable_welcome INTEGER NOT NULL DEFAULT 1,
  enable_marketing INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  customer_snapshot_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded')),
  payment_status TEXT NOT NULL CHECK(payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
  fulfillment_status TEXT NOT NULL CHECK(fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  discount_total_cents INTEGER NOT NULL DEFAULT 0,
  shipping_total_cents INTEGER NOT NULL DEFAULT 0,
  tax_total_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GHS',
  discount_codes_json TEXT,
  shipping_json TEXT NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  source TEXT NOT NULL DEFAULT 'web',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  delivered_at TEXT,
  shipped_at TEXT,
  confirmed_at TEXT,
  processing_at TEXT,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  product_snapshot_json TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  original_price_cents INTEGER,
  line_total_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  gateway TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')),
  provider_reference TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  customer_id TEXT,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  description TEXT NOT NULL,
  previous_state_json TEXT,
  new_state_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS shop_appearance_settings (
  id TEXT PRIMARY KEY,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  surface_color TEXT,
  text_color TEXT,
  muted_text_color TEXT,
  border_color TEXT,
  heading_font TEXT,
  body_font TEXT,
  border_radius TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_delivery_methods_zone ON delivery_methods(zone_id);
