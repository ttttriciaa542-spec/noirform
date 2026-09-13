import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bigdotcollections',
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
};

let pool;

async function ensureDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true,
    });

    const dbName = dbConfig.database;
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    pool = mysql.createPool({ ...dbConfig, database: dbName });
    await pool.query('SELECT 1');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(128) PRIMARY KEY,
        sku VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        category_id VARCHAR(128) NOT NULL,
        price_cents INT NOT NULL DEFAULT 0,
        original_price_cents INT NULL,
        stock INT NOT NULL DEFAULT 0,
        low_stock_threshold INT NOT NULL DEFAULT 3,
        rating DECIMAL(3,2) NOT NULL DEFAULT 0,
        reviews INT NOT NULL DEFAULT 0,
        is_new TINYINT(1) NOT NULL DEFAULT 0,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        is_best_seller TINYINT(1) NOT NULL DEFAULT 0,
        is_published TINYINT(1) NOT NULL DEFAULT 1,
        status VARCHAR(32) NOT NULL DEFAULT 'published',
        material TEXT,
        care TEXT,
        fit TEXT,
        image_url TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        KEY idx_products_category_id (category_id),
        KEY idx_products_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sizes (
        id VARCHAR(128) PRIMARY KEY,
        label VARCHAR(32) NOT NULL UNIQUE,
        sort_order INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        product_id VARCHAR(128) NOT NULL,
        size_id VARCHAR(128) NOT NULL,
        sku_suffix VARCHAR(32) NULL,
        stock INT NOT NULL DEFAULT 0,
        reserved INT NOT NULL DEFAULT 0,
        low_stock_threshold INT NOT NULL DEFAULT 2,
        sort_order INT NOT NULL DEFAULT 0,
        PRIMARY KEY (product_id, size_id),
        INDEX idx_product_sizes_product (product_id),
        INDEX idx_product_sizes_size (size_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS colors (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(128) NOT NULL UNIQUE,
        swatch VARCHAR(32) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_colors (
        product_id VARCHAR(128) NOT NULL,
        color_id VARCHAR(128) NOT NULL,
        PRIMARY KEY (product_id, color_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) DEFAULT NULL,
        email VARCHAR(255) NULL,
        name VARCHAR(255) NULL,
        phone VARCHAR(64) NULL,
        accepts_marketing TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        UNIQUE KEY uk_customers_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(128) PRIMARY KEY,
        reference VARCHAR(128) NOT NULL UNIQUE,
        customer_id VARCHAR(128) NOT NULL,
        customer_snapshot_json LONGTEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        payment_status VARCHAR(32) NOT NULL DEFAULT 'paid',
        fulfillment_status VARCHAR(32) NOT NULL DEFAULT 'unfulfilled',
        subtotal_cents INT NOT NULL DEFAULT 0,
        discount_total_cents INT NOT NULL DEFAULT 0,
        shipping_total_cents INT NOT NULL DEFAULT 0,
        tax_total_cents INT NOT NULL DEFAULT 0,
        total_cents INT NOT NULL DEFAULT 0,
        currency VARCHAR(16) NOT NULL DEFAULT 'GHS',
        discount_codes_json TEXT NULL,
        shipping_json LONGTEXT NOT NULL,
        payment_method VARCHAR(64) NULL,
        payment_reference VARCHAR(128) NULL,
        source VARCHAR(64) NOT NULL DEFAULT 'web',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        delivered_at DATETIME NULL,
        shipped_at DATETIME NULL,
        confirmed_at DATETIME NULL,
        processing_at DATETIME NULL,
        KEY idx_orders_customer_id (customer_id),
        KEY idx_orders_status (status),
        KEY idx_orders_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(128) PRIMARY KEY,
        order_id VARCHAR(128) NOT NULL,
        product_id VARCHAR(128) NOT NULL,
        variant_id VARCHAR(128) NULL,
        product_snapshot_json LONGTEXT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price_cents INT NOT NULL DEFAULT 0,
        original_price_cents INT NULL,
        line_total_cents INT NOT NULL DEFAULT 0,
        tax_cents INT NOT NULL DEFAULT 0,
        discount_cents INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL,
        KEY idx_order_items_order_id (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await seedSampleStore();
  } catch (error) {
    console.error('MySQL init failed:', error.message);
    pool = mysql.createPool({ ...dbConfig, database: dbConfig.database });
  }
}

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (_req, res) => {
  try {
    if (!pool) {
      await ensureDatabase();
    }
    await pool.query('SELECT 1');
    res.json({ ok: true, database: dbConfig.database });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

async function seedSampleStore() {
  const [categoryRows] = await pool.query('SELECT COUNT(*) AS total FROM categories');
  const [productRows] = await pool.query('SELECT COUNT(*) AS total FROM products');
  const productTotal = Number(productRows[0].total || 0);
  const totalCategories = Number(categoryRows[0].total || 0);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const categories = [
    ['cat-bikinis', 'Bikinis', 'bikinis', 'Two-piece swimwear in warm, flattering tones.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'],
    ['cat-one-piece', 'One Piece', 'one-piece', 'Clean silhouettes and premium stretch for unapologetic confidence.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'],
    ['cat-cover-ups', 'Cover Ups', 'cover-ups', 'Light layers that take you from beach to dinner without changing pace.', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'],
    ['cat-beachwear', 'Beachwear', 'beachwear', 'Resort essentials designed for sun, sea and long afternoons outdoors.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'],
    ['cat-accessories', 'Accessories', 'accessories', 'Small finishing pieces to complete your holiday look.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'],
  ];

  if (totalCategories === 0) {
    for (const [id, name, slug, description, imageUrl] of categories) {
      await pool.query(
        'INSERT INTO categories (id, name, slug, description, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)',
        [id, name, slug, description, imageUrl, now, now],
      );
    }
  }

  const sizeLabels = ['XS', 'S', 'M', 'L', 'XL'];
  for (let index = 0; index < sizeLabels.length; index += 1) {
    const label = sizeLabels[index];
    const id = `size-${label.toLowerCase()}`;
    await pool.query(
      'INSERT INTO sizes (id, label, sort_order) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE label = VALUES(label)',
      [id, label, index + 1],
    );
  }

  const colorMap = new Map([
    ['Clay', '#b8532c'],
    ['Cocoa', '#5c3a2e'],
    ['Forest', '#3a4d3d'],
    ['Sand', '#d8c3a5'],
    ['Ivory', '#efe6d6'],
    ['Blush', '#f3d1d1'],
    ['Rose', '#d78598'],
    ['Ocean', '#5d88a5'],
    ['Black', '#121212'],
    ['White', '#ffffff'],
    ['Coral', '#df6b62'],
    ['Peach', '#edbca3'],
    ['Stone', '#9ea59c'],
    ['Sage', '#a9bfae'],
    ['Terracotta', '#b96a4a'],
    ['Linen', '#e8dfd2'],
  ]);

  for (const [name, swatch] of colorMap.entries()) {
    const colorId = `color-${name.toLowerCase().replace(/\s+/g, '-')}`;
    await pool.query(
      'INSERT INTO colors (id, name, swatch) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE swatch = VALUES(swatch)',
      [colorId, name, swatch],
    );
  }

  const productSeeds = [
    {
      id: 'prod-sunset', sku: 'BDC-0001', name: 'Sunset Bikini Set', slug: 'sunset-bikini-set', description: 'A ribbed two-piece in a deep sunset clay. Fully lined, with adjustable ties and a high-cut leg.', categoryId: 'cat-bikinis', priceCents: 32000, originalPriceCents: 40000, stock: 14, rating: 4.8, reviews: 32, isNew: 1, isFeatured: 1, isBestSeller: 1, material: '82% recycled nylon, 18% elastane.', care: 'Rinse in cold water after wear.', fit: 'True to size.', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', colors: ['Clay', 'Cocoa'], sizes: { XS: 3, S: 4, M: 4, L: 3, XL: 2 },
    },
    {
      id: 'prod-palm-shadow', sku: 'BDC-0002', name: 'Palm Shadow Bikini', slug: 'palm-shadow-bikini', description: 'A flattering high-waist bikini with a soft matte finish and relaxed fit for all-day wear.', categoryId: 'cat-bikinis', priceCents: 34000, originalPriceCents: 42000, stock: 11, rating: 4.7, reviews: 29, isNew: 1, isFeatured: 1, isBestSeller: 0, material: 'Soft matte nylon blend with stretch recovery.', care: 'Hand wash cold and line dry.', fit: 'High-waisted fit with adjustable straps.', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', colors: ['Forest', 'Sand'], sizes: { XS: 2, S: 3, M: 3, L: 2, XL: 1 },
    },
    {
      id: 'prod-sand-dune', sku: 'BDC-0003', name: 'Sand Dune Top', slug: 'sand-dune-top', description: 'Minimal top in warm sand tones with supportive structure and clean, easy lines.', categoryId: 'cat-beachwear', priceCents: 21000, originalPriceCents: 26000, stock: 17, rating: 4.5, reviews: 18, isNew: 0, isFeatured: 1, isBestSeller: 0, material: 'Soft knit with stretch support.', care: 'Warm wash on a gentle cycle.', fit: 'Slightly fitted through the bust.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', colors: ['Sand', 'Ivory'], sizes: { XS: 4, S: 5, M: 5, L: 3, XL: 2 },
    },
    {
      id: 'prod-riviera-lace', sku: 'BDC-0004', name: 'Riviera Lace Set', slug: 'riviera-lace-set', description: 'A sculpted coastal set with lace detail, flattering waistline and a lightweight feel.', categoryId: 'cat-one-piece', priceCents: 46000, originalPriceCents: 56000, stock: 9, rating: 4.9, reviews: 41, isNew: 1, isFeatured: 1, isBestSeller: 1, material: 'Stretch lace with soft lining.', care: 'Hand wash and air dry out of direct heat.', fit: 'True to size with a sculpted waistline.', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', colors: ['Blush', 'Rose'], sizes: { XS: 2, S: 3, M: 2, L: 2, XL: 1 },
    },
    {
      id: 'prod-ocean-glow', sku: 'BDC-0005', name: 'Ocean Glow One Piece', slug: 'ocean-glow-one-piece', description: 'A polished one-piece with a plunging neckline and low back for resort-ready confidence.', categoryId: 'cat-one-piece', priceCents: 42000, originalPriceCents: 52000, stock: 12, rating: 4.8, reviews: 36, isNew: 0, isFeatured: 1, isBestSeller: 1, material: 'Premium swim jersey with soft matte finish.', care: 'Rinse and dry in shade after use.', fit: 'Supportive with a sleek overall fit.', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80', colors: ['Ocean', 'Black'], sizes: { XS: 2, S: 3, M: 3, L: 2, XL: 2 },
    },
    {
      id: 'prod-seabreeze-wrap', sku: 'BDC-0006', name: 'Seabreeze Wrap', slug: 'seabreeze-wrap', description: 'A breezy cover-up that moves effortlessly from pool to dinner in one easy step.', categoryId: 'cat-cover-ups', priceCents: 28000, originalPriceCents: 36000, stock: 15, rating: 4.6, reviews: 23, isNew: 1, isFeatured: 0, isBestSeller: 0, material: 'Lightweight linen blend.', care: 'Cool hand wash and line dry.', fit: 'Relaxed one-size silhouette.', imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', colors: ['White', 'Sand'], sizes: { XS: 3, S: 4, M: 4, L: 3, XL: 2 },
    },
    {
      id: 'prod-coral-reef', sku: 'BDC-0007', name: 'Coral Reef Bikini', slug: 'coral-reef-bikini', description: 'A vibrant coral bikini with a light but sporty fit engineered for movement and sun.', categoryId: 'cat-bikinis', priceCents: 31000, originalPriceCents: 39000, stock: 13, rating: 4.7, reviews: 25, isNew: 0, isFeatured: 1, isBestSeller: 1, material: 'High-stretch recycled nylon.', care: 'Gentle hand wash, avoid chlorine.', fit: 'Comfortably snug through the waist.', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', colors: ['Coral', 'Peach'], sizes: { XS: 2, S: 3, M: 3, L: 3, XL: 2 },
    },
    {
      id: 'prod-resort-tote', sku: 'BDC-0008', name: 'Resort Tote', slug: 'resort-tote', description: 'A roomy everyday beach tote with soft structure and room for your essentials.', categoryId: 'cat-accessories', priceCents: 18000, originalPriceCents: 23000, stock: 21, rating: 4.4, reviews: 14, isNew: 0, isFeatured: 0, isBestSeller: 0, material: 'Water resistant canvas.', care: 'Wipe clean with a damp cloth.', fit: 'Single size with zipped inner pocket.', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', colors: ['Stone', 'Sage'], sizes: { XS: 1, S: 1, M: 1, L: 1, XL: 1 },
    },
    {
      id: 'prod-luma-bottom', sku: 'BDC-0009', name: 'Luma High-Waist Bottom', slug: 'luma-high-waist-bottom', description: 'A high-rise bikini bottom designed to be flattering, supportive and easy to style.', categoryId: 'cat-bikinis', priceCents: 18000, originalPriceCents: 24000, stock: 19, rating: 4.3, reviews: 17, isNew: 1, isFeatured: 0, isBestSeller: 0, material: 'Stretch matte knit.', care: 'Cold wash and line dry.', fit: 'High-rise fit with a smooth finish.', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', colors: ['Blush', 'Sand'], sizes: { XS: 4, S: 5, M: 5, L: 3, XL: 2 },
    },
    {
      id: 'prod-afterglow-set', sku: 'BDC-0010', name: 'Afterglow Resort Set', slug: 'afterglow-resort-set', description: 'A relaxed, resort-ready set layered in soft earth tones for an effortless vacation mood.', categoryId: 'cat-beachwear', priceCents: 39000, originalPriceCents: 47000, stock: 10, rating: 4.8, reviews: 31, isNew: 1, isFeatured: 1, isBestSeller: 1, material: 'Linen and stretch cotton blend.', care: 'Wash on cool and avoid high heat.', fit: 'Easy, softly relaxed fit.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', colors: ['Terracotta', 'Linen'], sizes: { XS: 2, S: 3, M: 3, L: 2, XL: 1 },
    },
  ];

  if (productTotal >= productSeeds.length) {
    return;
  }

  for (const product of productSeeds) {
    await pool.query(
      `INSERT INTO products (id, sku, name, slug, description, category_id, price_cents, original_price_cents, stock, low_stock_threshold, rating, reviews, is_new, is_featured, is_best_seller, is_published, status, material, care, fit, image_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`,
      [
        product.id, product.sku, product.name, product.slug, product.description, product.categoryId,
        product.priceCents, product.originalPriceCents, product.stock, 3, product.rating, product.reviews,
        product.isNew, product.isFeatured, product.isBestSeller, 1, 'published', product.material, product.care,
        product.fit, product.imageUrl, now, now,
      ],
    );

    for (const [sizeLabel, stockLevel] of Object.entries(product.sizes)) {
      const sizeId = `size-${sizeLabel.toLowerCase()}`;
      await pool.query(
        'INSERT INTO product_sizes (product_id, size_id, sku_suffix, stock, reserved, low_stock_threshold, sort_order) VALUES (?, ?, ?, ?, 0, 2, ?) ON DUPLICATE KEY UPDATE stock = VALUES(stock)',
        [product.id, sizeId, sizeLabel, stockLevel, Object.keys(product.sizes).indexOf(sizeLabel) + 1],
      );
    }

    for (const colorName of product.colors) {
      const colorId = `color-${colorName.toLowerCase().replace(/\s+/g, '-')}`;
      await pool.query(
        'INSERT INTO product_colors (product_id, color_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE product_id = VALUES(product_id)',
        [product.id, colorId],
      );
    }
  }
}

const safeString = (value, fallback = '') => (value == null ? fallback : String(value));

function normalizeProductRow(row) {
  const images = [];
  if (row.image_url) {
    images.push({ id: `${row.id}-main`, url: row.image_url, alt: row.name });
  }
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    price: Number(row.price_cents || 0) / 100,
    originalPrice: row.original_price_cents ? Number(row.original_price_cents) / 100 : undefined,
    images,
    category: row.category_slug || 'bikinis',
    collections: [],
    sizes: row.sizes ? row.sizes.split(',').filter(Boolean) : [],
    colors: row.colors ? row.colors.split(',').map((name) => ({ name, swatch: '#d8c3a5' })) : [],
    stock: Number(row.stock || 0),
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    isNew: !!row.is_new,
    isFeatured: !!row.is_featured,
    isBestSeller: !!row.is_best_seller,
    createdAt: row.created_at || new Date().toISOString(),
    details: {
      material: row.material || '',
      care: row.care || '',
      fit: row.fit || '',
    },
  };
}

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.slug AS category_slug,
        GROUP_CONCAT(DISTINCT s.label ORDER BY s.sort_order SEPARATOR ',') AS sizes,
        GROUP_CONCAT(DISTINCT co.name ORDER BY co.name SEPARATOR ',') AS colors,
        COALESCE(SUM(ps.stock), p.stock) AS stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_sizes ps ON ps.product_id = p.id
      LEFT JOIN sizes s ON s.id = ps.size_id
      LEFT JOIN product_colors pc ON pc.product_id = p.id
      LEFT JOIN colors co ON co.id = pc.color_id
      GROUP BY p.id
    `);

    const products = rows.map(normalizeProductRow);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.slug AS category_slug,
        GROUP_CONCAT(DISTINCT s.label ORDER BY s.sort_order SEPARATOR ',') AS sizes,
        GROUP_CONCAT(DISTINCT co.name ORDER BY co.name SEPARATOR ',') AS colors
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_sizes ps ON ps.product_id = p.id
      LEFT JOIN sizes s ON s.id = ps.size_id
      LEFT JOIN product_colors pc ON pc.product_id = p.id
      LEFT JOIN colors co ON co.id = pc.color_id
      WHERE p.slug = ?
      GROUP BY p.id
    `, [req.params.slug]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(normalizeProductRow(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders/track', async (req, res) => {
  const reference = safeString(req.query.reference, '').trim();
  const email = safeString(req.query.email, '').trim().toLowerCase();

  try {
    if (!reference) return res.status(400).json({ message: 'reference is required' });

    const [rows] = await pool.query(`
      SELECT o.*, c.email, c.name AS customer_name, c.phone AS customer_phone, JSON_UNQUOTE(JSON_EXTRACT(o.customer_snapshot_json, '$.fullName')) AS customer_full_name
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.reference = ?
      LIMIT 1
    `, [reference]);

    const order = rows[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (email && String(order.email || '').toLowerCase() !== email) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const trackingSteps = [
      { label: 'Order placed', complete: true },
      { label: 'Email confirmation sent', complete: true },
      { label: 'Packed and dispatched', complete: ['confirmed', 'processing', 'shipped', 'delivered'].includes((order.status || '').toLowerCase()) },
      { label: 'Out for delivery', complete: ['shipped', 'delivered'].includes((order.status || '').toLowerCase()) },
      { label: 'Delivered', complete: (order.status || '').toLowerCase() === 'delivered' },
    ];

    const shipping = JSON.parse(order.shipping_json || '{}');
    const customerSnapshot = JSON.parse(order.customer_snapshot_json || '{}');

    res.json({
      reference: order.reference,
      email: customerSnapshot.email || order.email || '',
      productName: 'Bikini order',
      status: safeString(order.status, 'Pending'),
      courier: 'BigDot delivery',
      estimatedArrival: '3-5 business days',
      destination: [shipping.city, shipping.region].filter(Boolean).join(', ') || 'Delivery destination pending',
      dispatchAt: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Within 24 hours',
      deliveryWindow: '3-5 business days',
      trackingSteps,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/products', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.slug AS category_slug,
        GROUP_CONCAT(DISTINCT s.label ORDER BY s.sort_order SEPARATOR ',') AS sizes,
        GROUP_CONCAT(DISTINCT co.name ORDER BY co.name SEPARATOR ',') AS colors,
        COALESCE(SUM(ps.stock), p.stock) AS stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_sizes ps ON ps.product_id = p.id
      LEFT JOIN sizes s ON s.id = ps.size_id
      LEFT JOIN product_colors pc ON pc.product_id = p.id
      LEFT JOIN colors co ON co.id = pc.color_id
      GROUP BY p.id
    `);

    const products = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      category: row.category_slug || 'bikinis',
      subcategory: row.category_slug || 'bikinis',
      price: Number(row.price_cents || 0) / 100,
      originalPrice: row.original_price_cents ? Number(row.original_price_cents) / 100 : undefined,
      images: row.image_url ? [{ id: `${row.id}-main`, url: row.image_url, alt: row.name, originalUrl: row.image_url, backgroundRemoved: false, processingAvailable: false }] : [],
      sizes: row.sizes ? row.sizes.split(',').filter(Boolean) : [],
      sizeStock: {},
      colors: row.colors ? row.colors.split(',').filter(Boolean).map((name) => ({ name, swatch: '#d8c3a5' })) : [],
      sku: row.sku,
      stock: Number(row.stock || 0),
      lowStockThreshold: Number(row.low_stock_threshold || 3),
      status: row.status === 'published' ? 'active' : row.status,
      featured: !!row.is_featured,
      tags: [row.category_slug || 'bikinis'],
      variants: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/orders', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, JSON_UNQUOTE(JSON_EXTRACT(o.customer_snapshot_json, '$.fullName')) AS customer_name,
             JSON_UNQUOTE(JSON_EXTRACT(o.customer_snapshot_json, '$.email')) AS customer_email,
             JSON_UNQUOTE(JSON_EXTRACT(o.customer_snapshot_json, '$.phone')) AS customer_phone
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    const orders = rows.map((row) => {
      const customerSnapshot = JSON.parse(row.customer_snapshot_json || '{}');
      const shipping = JSON.parse(row.shipping_json || '{}');
      return {
        id: row.id,
        reference: row.reference,
        createdAt: row.created_at,
        customer: {
          id: row.customer_id,
          name: customerSnapshot.fullName || row.customer_name || 'Customer',
          email: customerSnapshot.email || row.customer_email || '',
          phone: customerSnapshot.phone || row.customer_phone || '',
        },
        customerSnapshot: customerSnapshot || {},
        items: [],
        subtotal: Number(row.subtotal_cents || 0) / 100,
        discount: Number(row.discount_total_cents || 0) / 100,
        shippingFee: Number(row.shipping_total_cents || 0) / 100,
        total: Number(row.total_cents || 0) / 100,
        paymentStatus: row.payment_status || 'Paid',
        status: (row.status || 'Pending').replace(/^./, (value) => value.toUpperCase()),
        deliveryMethod: 'Standard delivery',
        shipping: {
          fullName: customerSnapshot.fullName || shipping.fullName || 'Customer',
          phone: customerSnapshot.phone || shipping.phone || '',
          region: shipping.region || '',
          city: shipping.city || '',
          street: shipping.street || '',
          instructions: shipping.instructions,
        },
        payment: {
          method: 'Card',
          transactionId: row.payment_reference || row.reference,
          paidAt: row.created_at,
        },
      };
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/orders', async (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.reference) {
      return res.status(400).json({ message: 'Order payload is required' });
    }

    const orderId = order.id || `ord-${Date.now()}`;
    const customerId = order.customer?.id || `cust-${Date.now()}`;
    const createdAt = order.createdAt || new Date().toISOString();
    const snapshot = JSON.stringify(order.customerSnapshot || {
      fullName: order.customer?.name || order.shipping?.fullName || 'Customer',
      email: order.customer?.email || '',
      phone: order.customer?.phone || order.shipping?.phone || '',
    });

    const shippingJson = JSON.stringify(order.shipping || {});
    const totalCents = Math.round((Number(order.total) || 0) * 100);
    const subtotalCents = Math.round((Number(order.subtotal) || 0) * 100);
    const shippingFeeCents = Math.round((Number(order.shippingFee) || 0) * 100);
    const discountCents = Math.round((Number(order.discount) || 0) * 100);

    const status = (order.status || 'Pending').toLowerCase();
    const paymentStatus = (order.paymentStatus || 'Paid').toLowerCase();

    await pool.query(`
      INSERT INTO customers (id, user_id, phone, accepts_marketing, created_at, updated_at)
      VALUES (?, ?, ?, 0, ?, ?)
      ON DUPLICATE KEY UPDATE phone = VALUES(phone), updated_at = VALUES(updated_at)
    `, [customerId, customerId, order.customer?.phone || order.shipping?.phone || '', createdAt, createdAt]);

    await pool.query(`
      INSERT INTO orders (
        id, reference, customer_id, customer_snapshot_json, status, payment_status,
        fulfillment_status, subtotal_cents, discount_total_cents, shipping_total_cents,
        tax_total_cents, total_cents, currency, shipping_json, payment_method, payment_reference,
        source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'unfulfilled', ?, ?, ?, 0, ?, 'GHS', ?, ?, ?, 'web', ?, ?)
      ON DUPLICATE KEY UPDATE
        customer_snapshot_json = VALUES(customer_snapshot_json),
        status = VALUES(status),
        payment_status = VALUES(payment_status),
        subtotal_cents = VALUES(subtotal_cents),
        discount_total_cents = VALUES(discount_total_cents),
        shipping_total_cents = VALUES(shipping_total_cents),
        total_cents = VALUES(total_cents),
        shipping_json = VALUES(shipping_json),
        payment_reference = VALUES(payment_reference),
        updated_at = VALUES(updated_at)
    `, [
      orderId, order.reference, customerId, snapshot, status, paymentStatus,
      subtotalCents, discountCents, shippingFeeCents, totalCents,
      shippingJson, order.payment?.method || 'Card', order.payment?.transactionId || order.reference,
      createdAt, createdAt,
    ]);

    res.status(201).json({ ok: true, reference: order.reference });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};
    const rawStatus = String(status ?? '').trim();
    if (!rawStatus) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const allowed = ['pending', 'confirmed', 'processing', 'ready for delivery', 'shipped', 'delivered', 'cancelled', 'refunded'];
    const normalizedStatus = rawStatus.toLowerCase();
    if (!allowed.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Unsupported order status' });
    }

    const paymentStatus = normalizedStatus === 'refunded'
      ? 'refunded'
      : normalizedStatus === 'cancelled'
        ? 'failed'
        : 'paid';

    const timestampFieldMap = {
      confirmed: 'confirmed_at',
      processing: 'processing_at',
      shipped: 'shipped_at',
      delivered: 'delivered_at',
    };

    const updates = [
      'status = ?',
      'payment_status = ?',
      'updated_at = NOW()',
    ];
    const params = [normalizedStatus, paymentStatus];

    const field = timestampFieldMap[normalizedStatus];
    if (field) {
      updates.push(`${field} = NOW()`);
    }

    await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, [...params, req.params.id]);

    res.json({ ok: true, status: normalizedStatus, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

async function startServer() {
  await ensureDatabase();
  app.listen(PORT, () => {
    console.log(`BigDot API listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start API server:', error);
  process.exit(1);
});
