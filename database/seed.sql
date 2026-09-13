-- Seed data is intentionally lightweight and keeps the UI look the same.
-- Insert shop settings.
INSERT OR IGNORE INTO shop_settings (
  id, store_name, tagline, store_email, store_phone, store_address,
  currency, currency_symbol, timezone, maintenance_mode, maintenance_message, updated_at
) VALUES (
  'shop-settings',
  'BigDotCollections',
  'Women\'s swimwear and fashion, made in Ghana.',
  'hello@bigdotcollections.com',
  '+233 30 220 1234',
  '12 Coastal Road, Accra, Greater Accra, Ghana',
  'GHS',
  'GH₵',
  'Africa/Accra',
  0,
  NULL,
  '2026-08-20T12:00:00Z'
);

INSERT OR IGNORE INTO appearance_settings (
  id, primary_color, secondary_color, accent_color, background_color,
  surface_color, text_color, muted_text_color, border_color,
  heading_font, body_font, border_radius, updated_at
) VALUES (
  'appearance-settings',
  '#3a3a38', '#d8c3a5', '#b8532c', '#f5f0e8',
  '#faf8f4', '#2c2c2a', '#6b6560', '#e0d9ce',
  'Bodoni Moda', 'Jost', 'md', '2026-08-20T12:00:00Z'
);

INSERT OR IGNORE INTO categories (id, name, slug, description, image_url, sort_order, is_visible, created_at, updated_at)
VALUES
  ('c1', 'Bikinis', 'bikinis', 'Two-piece shapes cut to flatter, in tonal shades built for the sun.', '/assets/p1.jpg', 0, 1, '2026-01-01', '2026-08-20'),
  ('c2', 'Swimwear', 'swimwear', 'One-pieces and swim sets designed for water and everything after it.', '/assets/p3.jpg', 1, 1, '2026-01-01', '2026-08-20'),
  ('c3', 'Dresses', 'dresses', 'From slip minis to long linen — dresses that carry the whole day.', '/assets/p5.jpg', 2, 1, '2026-01-01', '2026-08-20'),
  ('c4', 'Tops', 'tops', 'Knits, crops and clean lines to build the rest of the look around.', '/assets/p6.jpg', 3, 1, '2026-01-01', '2026-08-20'),
  ('c5', 'Bottoms', 'bottoms', 'Relaxed trousers, skirts and shorts in warm, wearable neutrals.', '/assets/p7.jpg', 4, 1, '2026-01-01', '2026-08-20'),
  ('c6', 'Sets', 'sets', 'Matched pieces, one decision. Wear together or break them apart.', '/assets/p2.jpg', 5, 1, '2026-01-01', '2026-08-20'),
  ('c7', 'Beachwear', 'beachwear', 'Cover-ups and easy layers for sand, boat days and long evenings.', '/assets/p1.jpg', 6, 1, '2026-01-01', '2026-08-20'),
  ('c8', 'Accessories', 'accessories', 'Bags, shades and small pieces that finish the look.', '/assets/p8.jpg', 7, 1, '2026-01-01', '2026-08-20');

INSERT OR IGNORE INTO collections (id, name, slug, tagline, description, image_url, is_visible, sort_order, created_at, updated_at)
VALUES
  ('col1', 'The Summer Edit', 'summer-edit', 'Pieces made for sun-soaked days.', 'Warm neutrals, easy shapes and fabric that moves. The edit we keep coming back to.', '/assets/editorial.jpg', 1, 0, '2026-01-01', '2026-08-20'),
  ('col2', 'Vacation Mode', 'vacation-mode', 'Packed in five minutes. Worn all week.', 'A short list of pieces that work from the airport to the last night out.', '/assets/hero-mobile.jpg', 1, 1, '2026-01-01', '2026-08-20'),
  ('col3', 'Beach Club', 'beach-club', 'Water, sand, and somewhere to be after.', 'Swim and cover-ups styled to be seen, not just swum in.', '/assets/campaign.jpg', 1, 2, '2026-01-01', '2026-08-20');

INSERT OR IGNORE INTO users (id, email, full_name, password_hash, role, is_active, created_at, updated_at)
VALUES
  ('user-admin', 'admin@bigdotcollections.com', 'Admin User', 'demo-hash', 'admin', 1, '2026-01-01', '2026-08-20'),
  ('user-cust-1', 'ami.k@email.com', 'Amira K.', 'demo-hash', 'customer', 1, '2026-03-15', '2026-08-27'),
  ('user-cust-2', 'kwame.b@email.com', 'Kwame B.', 'demo-hash', 'customer', 1, '2026-04-20', '2026-08-25');

INSERT OR IGNORE INTO customers (id, user_id, phone, accepts_marketing, created_at, updated_at)
VALUES
  ('cust-001', 'user-cust-1', '+233 244 123 456', 1, '2026-03-15', '2026-08-27'),
  ('cust-002', 'user-cust-2', '+233 209 987 654', 1, '2026-04-20', '2026-08-25');

INSERT OR IGNORE INTO sizes (id, label, sort_order)
VALUES
  ('size-xs', 'XS', 0), ('size-s', 'S', 1), ('size-m', 'M', 2), ('size-l', 'L', 3), ('size-xl', 'XL', 4), ('size-xxl', 'XXL', 5);

INSERT OR IGNORE INTO colors (id, name, swatch)
VALUES
  ('color-clay', 'Clay', '#b8532c'), ('color-cocoa', 'Cocoa', '#5c3a2e'), ('color-sage', 'Sage', '#a9bfae'), ('color-cream', 'Cream', '#efe6d6'), ('color-black', 'Black', '#161616');

INSERT OR IGNORE INTO delivery_zones (id, name, regions, rate_cents, free_shipping_threshold_cents, estimated_days_min, estimated_days_max, is_active, sort_order, created_at, updated_at)
VALUES
  ('zone-001', 'Greater Accra', 'Greater Accra', 2500, 50000, 1, 2, 1, 0, '2026-01-01', '2026-08-20'),
  ('zone-002', 'Ashanti & Environs', 'Ashanti', 4000, 80000, 2, 4, 1, 1, '2026-01-01', '2026-08-20'),
  ('zone-003', 'Other Regions', 'Western,Eastern,Northern', 5500, 100000, 3, 7, 1, 2, '2026-01-01', '2026-08-20');

INSERT OR IGNORE INTO delivery_methods (id, name, description, zone_id, rate_cents, free_shipping_threshold_cents, estimated_days_min, estimated_days_max, carrier_key, requires_pickup_point, is_active, sort_order, created_at, updated_at)
VALUES
  ('dm-001', 'Ghana Post', 'Nationwide postal delivery.', 'zone-001', 2500, 50000, 1, 2, 'ghana-post', 0, 1, 0, '2026-01-01', '2026-08-20'),
  ('dm-002', 'DHL Express', 'Express courier service.', 'zone-001', 4500, NULL, 1, 1, 'dhl', 0, 1, 1, '2026-01-01', '2026-08-20'),
  ('dm-003', 'Pickup Point', 'Collect from nearest pickup point.', 'zone-002', 2000, 80000, 2, 3, NULL, 1, 1, 2, '2026-01-01', '2026-08-20');

INSERT OR IGNORE INTO discounts (id, code, name, description, type, value_cents, applies_to, min_subtotal_cents, first_order_only, usage_limit, usage_limit_per_customer, usage_count, is_active, starts_at, ends_at, combinable, priority, created_at, updated_at)
VALUES
  ('disc-001', 'SUMMER20', 'Summer Sale', '20% off summer collection.', 'percentage', 2000, 'categories', 10000, 0, 500, 1, 342, 1, '2026-06-01T00:00:00Z', '2026-09-30T23:59:59Z', 0, 1, '2026-05-20', '2026-08-20'),
  ('disc-002', 'WELCOME10', 'Welcome Discount', '10% off first order.', 'percentage', 1000, 'all', NULL, 1, 1000, 1, 856, 1, '2026-01-01T00:00:00Z', NULL, 0, 2, '2026-01-01', '2026-08-20'),
  ('disc-003', 'FREESHIP', 'Free Shipping', 'Free shipping on orders over GH₵500.', 'free_shipping', 0, 'all', 50000, 0, 2000, 2, 1234, 1, '2026-01-01T00:00:00Z', NULL, 1, 3, '2026-01-01', '2026-08-20');
