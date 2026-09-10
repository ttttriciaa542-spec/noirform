-- Owner admin user (password: noir2026)
INSERT INTO users (email, password, name, role) VALUES
  ('owner@noirform.co', '$2b$10$J6nhiVEw77jeOUtm.HtSyOO4FTdyyi8YeiH20BQ3HkL2jLXlIGdiO', 'Ama Mensah', 'owner');

-- Global settings
INSERT INTO settings ("key", value, type, category) VALUES
  ('brand_name', 'NOIR/FORM', 'Text', 'general'),
  ('currency', 'GHS', 'Text', 'general'),
  ('currency_symbol', 'GHS ', 'Text', 'general'),
  ('contact_email', 'hello@noirform.co', 'Text', 'general'),
  ('phone', '+233 20 000 0000', 'Text', 'general'),
  ('instagram_url', 'https://instagram.com', 'URL', 'social'),
  ('tiktok_url', 'https://tiktok.com', 'URL', 'social'),
  ('facebook_url', 'https://facebook.com', 'URL', 'social'),
  ('x_url', 'https://x.com', 'URL', 'social'),
  ('hero_title', 'Dress with intention.', 'Text', 'content'),
  ('hero_description', 'Considered essentials for the lives we actually live. Designed in Accra, made in small runs.', 'Textarea', 'content'),
  ('hero_button', 'Shop collection', 'Text', 'content'),
  ('announcement', 'New collection available now', 'Text', 'content'),
  ('announcement_link', '#shop', 'Text', 'content'),
  ('founder_story', 'NOIR/FORM is an independent clothing studio founded by Ama Mensah. We make fewer, better pieces from a small studio in Accra, Ghana.', 'Textarea', 'content'),
  ('shipping_fee', '150', 'Number', 'shipping'),
  ('free_shipping_threshold', '1000', 'Number', 'shipping'),
  ('shipping_estimate', '2-4 days', 'Text', 'shipping'),
  ('privacy_policy', 'Your data is safe with us.', 'Textarea', 'policies'),
  ('terms', 'Terms and conditions apply.', 'Textarea', 'policies'),
  ('refund_policy', 'Returns accepted within 14 days.', 'Textarea', 'policies'),
  ('paystack_public_key', '', 'Text', 'payments'),
  ('paystack_secret_key', '', 'Text', 'payments');

-- Categories
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
  ('Dresses', 'dresses', NULL, 1),
  ('Bottoms', 'bottoms', NULL, 2),
  ('Tops', 'tops', NULL, 3),
  ('Accessories', 'accessories', NULL, 4);

-- Collections
INSERT INTO collections (title, slug, description, published, sort_order) VALUES
  ('SS26 The Quiet Form', 'ss26-quiet-form', 'A study in movement, restraint, and the spaces between.', TRUE, 1),
  ('Studio Editions', 'studio-editions', 'Curated pieces from the Accra studio.', TRUE, 2);

-- Products
INSERT INTO products (name, slug, sku, price, compare_price, status, featured, badge, description) VALUES
  ('The Column Dress', 'the-column-dress', 'NF-CD-001', 680, 780, 'Published', TRUE, 'Bestseller', 'A considered essential with a quiet point of view.'),
  ('Form Trouser', 'form-trouser', 'NF-FT-002', 540, NULL, 'Published', FALSE, 'New', 'Tailored trousers cut for ease.'),
  ('The Essential Shirt', 'the-essential-shirt', 'NF-ES-003', 350, 420, 'Published', TRUE, 'Studio pick', 'The shirt that does everything.'),
  ('Soft Structure Blazer', 'soft-structure-blazer', 'NF-SB-004', 980, NULL, 'Draft', FALSE, NULL, 'An unstructured layer for everyday wear.'),
  ('The Longline Skirt', 'the-longline-skirt', 'NF-LS-005', 620, NULL, 'Published', FALSE, 'New', 'A fluid skirt for movement.'),
  ('Frame Tank', 'frame-tank', 'NF-FT-006', 260, NULL, 'Published', FALSE, NULL, 'A simple essential tank.'),
  ('Cocoon Coat', 'cocoon-coat', 'NF-CC-007', 1250, NULL, 'Published', FALSE, NULL, 'An oversized coat for cooler days.'),
  ('Everyday Pleat', 'everyday-pleat', 'NF-EP-008', 620, NULL, 'Published', FALSE, NULL, 'A pleated dress for everyday.');

-- Product variants (size/color) + inventory
INSERT INTO product_variants (product_id, title, sku, price, compare_price, inventory, image) VALUES
  (1, 'Ink / S', 'NF-CD-001-IK-S', 680, 780, 12, NULL),
  (1, 'Ink / M', 'NF-CD-001-IK-M', 680, 780, 8, NULL),
  (1, 'Ink / L', 'NF-CD-001-IK-L', 680, 780, 5, NULL),
  (2, 'Ink / 28', 'NF-FT-002-IK-28', 540, NULL, 10, NULL),
  (2, 'Bone / 28', 'NF-FT-002-BN-28', 540, NULL, 6, NULL),
  (2, 'Ink / 30', 'NF-FT-002-IK-30', 540, NULL, 4, NULL),
  (3, 'Bone / S', 'NF-ES-003-BN-S', 350, 420, 7, NULL),
  (3, 'Bone / M', 'NF-ES-003-BN-M', 350, 420, 3, NULL),
  (3, 'Bone / L', 'NF-ES-003-BN-L', 350, 420, 0, NULL),
  (4, 'Ink / S', 'NF-SB-004-IK-S', 980, NULL, 2, NULL),
  (5, 'Ink / 6', 'NF-LS-005-IK-6', 620, NULL, 9, NULL),
  (6, 'Bone / S', 'NF-FT-006-BN-S', 260, NULL, 15, NULL),
  (7, 'Ink / M', 'NF-CC-007-IK-M', 1250, NULL, 1, NULL),
  (8, 'Bone / S', 'NF-EP-008-BN-S', 620, NULL, 0, NULL);

-- Product images (gallery)
INSERT INTO product_images (product_id, url, alt, sort_order) VALUES
  (1, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85', 'The Column Dress front', 1),
  (1, 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85', 'The Column Dress back', 2),
  (2, 'https://images.unsplash.com/photo-1506629905607-d9dbe6b3d8b6?auto=format&fit=crop&w=900&q=85', 'Form Trouser', 1),
  (3, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85', 'The Essential Shirt', 1),
  (4, 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85', 'Soft Structure Blazer', 1),
  (5, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85', 'The Longline Skirt', 1);

-- Pivot: product -> categories
INSERT INTO product_categories (product_id, category_id) VALUES
  (1, 1), (2, 2), (3, 3), (4, 3), (5, 2), (6, 3), (7, 3), (8, 1);

-- Pivot: product -> collections
INSERT INTO product_collections (product_id, collection_id) VALUES
  (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1),
  (1, 2), (3, 2), (5, 2), (7, 2);

-- Discount codes
INSERT INTO discounts (code, type, value, minimum_amount, usage_limit, used_count, per_customer_limit, expires_at, status) VALUES
  ('WELCOME10', 'percentage', 10, 0, NULL, 0, 1, '2026-12-31 23:59:59', 'Active'),
  ('FREESHIP', 'fixed', 150, 1000, 50, 0, 1, '2026-08-15 23:59:59', 'Active'),
  ('SS26LOVE', 'fixed', 200, 500, 100, 0, 1, '2026-09-30 23:59:59', 'Active');

-- Sample reviews
INSERT INTO reviews (product_id, customer_name, rating, comment, status) VALUES
  (3, 'Ama Mensah', 5, 'Perfect fit and beautiful fabric.', 'Approved'),
  (1, 'Kofi Asante', 5, 'The best dress I have ever owned.', 'Approved'),
  (2, 'Adwoa Mensah', 4, 'Great length and comfortable.', 'Pending');

-- Sample message
INSERT INTO messages (name, email, subject, body, status) VALUES
  ('Adwoa Mensah', 'adwoa@noirform.co', 'Question about sizing', 'Does the Column Dress run true to size?', 'Unread');
