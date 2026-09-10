import { query, execute, UPLOAD_DIR } from '../config';
import * as fs from 'fs';
import * as path from 'path';

export interface VariantRow {
  id: number;
  product_id: number;
  title: string;
  sku: string;
  price: any;
  compare_price: any;
  inventory: number;
  image: string | null;
  is_active: boolean;
}

export async function fetchProduct(id: number) {
  return (await query('SELECT * FROM products WHERE id = ?', [id]))[0] as any;
}

export async function fetchProductFull(id: number) {
  const product = await fetchProduct(id);
  if (!product) return null;
  const variants: any[] = await query('SELECT * FROM product_variants WHERE product_id = ? ORDER BY id', [id]);
  const images: any[] = await query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, id', [id]);
  const categories: any[] = await query(
    'SELECT c.id, c.name, c.slug FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = ? ORDER BY c.sort_order',
    [id]
  );
  const collections: any[] = await query(
    'SELECT cl.id, cl.title, cl.slug FROM collections cl JOIN product_collections pc ON pc.collection_id = cl.id WHERE pc.product_id = ?',
    [id]
  );
  const rating = await avgRating(id);
  return { ...product, variants, images, categories, collections, rating };
}

async function avgRating(productId: number) {
  const row = (await query('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = ? AND status = ?', [productId, 'Approved']))[0] as any;
  return { avg: row.avg ? Number(row.avg) : 0, count: Number(row.count || 0) };
}

export async function productToPublic(product: any) {
  const images: any[] = await query('SELECT url, alt FROM product_images WHERE product_id = ? ORDER BY sort_order, id', [product.id]);
  const variants: any[] = await query('SELECT id, title, sku, price, compare_price, inventory, image, is_active FROM product_variants WHERE product_id = ? ORDER BY id', [product.id]);
  const categories: any[] = await query('SELECT c.id, c.name, c.slug FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = ?', [product.id]);
  const collections: any[] = await query('SELECT cl.id, cl.title, cl.slug FROM collections cl JOIN product_collections pc ON pc.collection_id = cl.id WHERE pc.product_id = ?', [product.id]);
  const rating = await avgRating(product.id);
  const primary = images[0]?.url || null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price),
    compare_price: product.compare_price === null || product.compare_price === undefined ? null : Number(product.compare_price),
    status: product.status,
    featured: !!product.featured,
    badge: product.badge,
    description: product.description,
    primary_image: primary,
    images,
    variants,
    categories,
    collections,
    rating
  };
}

export async function buildProductPublic(slug: string) {
  const product = (await query('SELECT * FROM products WHERE slug = ? AND status = ?', [slug, 'Published']))[0] as any;
  if (!product) return null;
  return productToPublic(product);
}

export interface ListOpts {
  search?: string;
  status?: string;
  category?: string;
  collection?: string;
  page?: number;
  perPage?: number;
  featured?: string;
}

export async function listProductsPublic(opts: ListOpts) {
  let where = "WHERE p.status = 'Published'";
  const params: any[] = [];
  if (opts.search) { where += ' AND (p.name LIKE ? OR p.sku LIKE ?)'; params.push(`%${opts.search}%`, `%${opts.search}%`); }
  if (opts.category) {
    where += ' AND EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON c.id=pc.category_id WHERE pc.product_id=p.id AND c.slug=?)';
    params.push(opts.category);
  }
  if (opts.collection) {
    where += ' AND EXISTS (SELECT 1 FROM product_collections pc JOIN collections cl ON cl.id=pc.collection_id WHERE pc.product_id=p.id AND cl.slug=?)';
    params.push(opts.collection);
  }
  let sql = `SELECT p.* FROM products p ${where} ORDER BY p.featured DESC, p.created_at DESC`;
  const total = (await query(`SELECT COUNT(*) as n FROM products p ${where}`, params))[0] as any;
  const perPage = opts.perPage ? Math.max(1, opts.perPage) : null;
  let rows = await query(sql, params);
  let page = 1;
  if (perPage) {
    page = Math.max(1, opts.page || 1);
    rows = await query(`${sql} LIMIT ? OFFSET ?`, [...params, perPage, (page - 1) * perPage]);
  }
  const items = await Promise.all(rows.map(r => productToPublic(r)));
  return { items, total: Number((total as any).n), page, perPage };
}

export async function listProductsAdmin(opts: ListOpts) {
  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (opts.search) { where += ' AND (name LIKE ? OR sku LIKE ?)'; params.push(`%${opts.search}%`, `%${opts.search}%`); }
  if (opts.status && opts.status !== 'All') { where += ' AND status = ?'; params.push(opts.status); }
  const perPage = Math.max(1, Number(opts.perPage || 20));
  const page = Math.max(1, Number(opts.page || 1));
  const total = (await query(`SELECT COUNT(*) as n FROM products ${where}`, params))[0] as any;
  const rows = await query(
    `SELECT * FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, perPage, (page - 1) * perPage]
  );
  const items = await Promise.all(rows.map(r => fetchProductFull(r.id)));
  return { items, total: Number((total as any).n), page, perPage };
}

export async function syncProduct(id: number | null, payload: any) {
  const name = payload.name;
  const slug = payload.slug || slugify(name);
  const price = Number(payload.price || 0);
  const compare = payload.compare_price ? Number(payload.compare_price) : null;
  const sku = payload.sku || null;
  let productId: number;
  if (id) {
    productId = id;
    await execute(
      'UPDATE products SET name=?, slug=?, sku=?, price=?, compare_price=?, status=?, featured=?, badge=?, description=? WHERE id=?',
      [name, slug, sku, price, compare, payload.status || 'Draft', !!payload.featured, payload.badge || null, payload.description || null, id]
    );
  } else {
    const r = await execute(
      'INSERT INTO products (name, slug, sku, price, compare_price, status, featured, badge, description) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, slug, sku, price, compare, payload.status || 'Draft', !!payload.featured, payload.badge || null, payload.description || null]
    );
    productId = (r as any).insertId;
  }

  // Variants (replace)
  const variants: any[] = payload.variants || [];
  const existingVariants = await query('SELECT id FROM product_variants WHERE product_id = ?', [productId]);
  for (const v of variants) {
    const vt = v.title;
    const vSku = v.sku || null;
    const vPrice = Number(v.price || price);
    const vCompare = v.compare_price ? Number(v.compare_price) : null;
    const inv = Number(v.inventory || 0);
    const vImage = v.image || null;
    if (v.id) {
      await execute(
        'UPDATE product_variants SET title=?, sku=?, price=?, compare_price=?, inventory=?, image=?, is_active=? WHERE id=? AND product_id=?',
        [vt, vSku, vPrice, vCompare, inv, vImage, !!v.is_active, v.id, productId]
      );
    } else {
      await execute(
        'INSERT INTO product_variants (product_id, title, sku, price, compare_price, inventory, image, is_active) VALUES (?,?,?,?,?,?,?,?)',
        [productId, vt, vSku, vPrice, vCompare, inv, vImage, !!v.is_active]
      );
    }
  }
  const sentVariantIds = (variants.filter(v => v.id).map(v => v.id)) as number[];
  const removedVariants = existingVariants.filter((ev: any) => !sentVariantIds.includes(ev.id));
  for (const rv of removedVariants) {
    await execute('DELETE FROM product_variants WHERE id = ? AND product_id = ?', [rv.id, productId]);
  }

  // Images (replace)
  const images: any[] = payload.images || [];
  const existingImages = await query('SELECT id, url FROM product_images WHERE product_id = ?', [productId]);
  for (const im of images) {
    const fileName = (im.url || '').split('/').pop();
    if (im.id) {
      await execute('UPDATE product_images SET url=?, alt=? WHERE id=? AND product_id=?', [im.url, im.alt || null, im.id, productId]);
    } else {
      await execute('INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?,?,?,?)', [productId, im.url, im.alt || null, im.sort_order || 0]);
    }
  }
  const sentImageIds = (images.filter(i => i.id).map(i => i.id)) as number[];
  const removedImages = existingImages.filter((ei: any) => !sentImageIds.includes(ei.id));
  for (const ri of removedImages) {
    if (ri.url.startsWith('/uploads/')) {
      const file = ri.url.replace('/uploads/', '');
      const full = path.join(UPLOAD_DIR, file);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
    await execute('DELETE FROM product_images WHERE id = ?', [ri.id]);
  }

  // Pivot categories / collections (replace)
  const categoryIds = payload.category_ids || [];
  const collectionIds = payload.collection_ids || [];
  await execute('DELETE FROM product_categories WHERE product_id = ?', [productId]);
  for (const cid of categoryIds) {
    await execute('INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (?,?)', [productId, Number(cid)]);
  }
  await execute('DELETE FROM product_collections WHERE product_id = ?', [productId]);
  for (const clid of collectionIds) {
    await execute('INSERT IGNORE INTO product_collections (product_id, collection_id) VALUES (?,?)', [productId, Number(clid)]);
  }

  return fetchProductFull(productId);
}

export async function deleteProduct(id: number) {
  // image files cleaned by FK cascade on product_images; remove local uploads
  const images: any[] = await query('SELECT url FROM product_images WHERE product_id = ?', [id]);
  for (const im of images) {
    if (im.url.startsWith('/uploads/')) {
      const file = im.url.replace('/uploads/', '');
      const full = path.join(UPLOAD_DIR, file);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
  }
  await execute('DELETE FROM products WHERE id = ?', [id]);
}

export async function bestSellers(limit = 4) {
  const rows = (await query(`
    SELECT p.id, p.name, p.slug, p.price, p.compare_price,
           SUM(oi.quantity) as sold
    FROM products p
    JOIN product_variants pv ON pv.product_id=p.id
    JOIN order_items oi ON oi.variant_id=pv.id
    JOIN orders o ON o.id=oi.order_id
    WHERE o.payment_status = 'Paid'
    GROUP BY p.id
    ORDER BY sold DESC, p.featured DESC
    LIMIT ?
  `, [limit])) as any[];
  return Promise.all(rows.map(r => productToPublic(r)));
}

function slugify(str: string): string {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
