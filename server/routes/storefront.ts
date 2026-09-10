import { Router } from 'express';
import { query, execute, jsonError } from '../config';
import { productToPublic, listProductsPublic, buildProductPublic } from '../services/products';

const router = Router();

router.get('/store', async (req, res) => {
  try {
    const rows = await query("SELECT * FROM settings WHERE `key` NOT IN ('paystack_secret_key')");
    const settings: any = {};
    for (const r of rows) settings[r.key] = r.value;
    const featuredRows = await query("SELECT * FROM products WHERE status='Published' AND featured=TRUE ORDER BY created_at DESC LIMIT 8");
    const featured = await Promise.all(featuredRows.map(productToPublic));
    const collections = await query("SELECT id,title,slug,description,image,published FROM collections WHERE published=TRUE ORDER BY sort_order");
    const categories = await query("SELECT id,name,slug FROM categories ORDER BY sort_order");
    res.json({ settings, featured, collections, categories });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/categories', async (req, res) => {
  try {
    const rows = await query("SELECT c.*, (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id=c.id) as product_count FROM categories c ORDER BY sort_order, name");
    res.json(rows);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/collections', async (req, res) => {
  try {
    const rows = await query("SELECT * FROM collections WHERE published=TRUE ORDER BY sort_order");
    res.json(rows);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/categories/:slug', async (req, res) => {
  try {
    const category = (await query('SELECT * FROM categories WHERE slug=?', [req.params.slug]))[0] as any;
    if (!category) return jsonError(res, 'Category not found', 404);
    const rows = await query(
      `SELECT p.* FROM products p JOIN product_categories pc ON pc.product_id=p.id WHERE pc.category_id=? AND p.status='Published' ORDER BY p.created_at DESC`,
      [category.id]
    );
    const products = await Promise.all(rows.map(productToPublic));
    res.json({ ...category, products });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/collections/:slug', async (req, res) => {
  try {
    const collection = (await query('SELECT * FROM collections WHERE slug=? AND published=TRUE', [req.params.slug]))[0] as any;
    if (!collection) return jsonError(res, 'Collection not found', 404);
    const rows = await query(
      `SELECT p.* FROM products p JOIN product_collections pc ON pc.product_id=p.id WHERE pc.collection_id=? AND p.status='Published' ORDER BY p.created_at DESC`,
      [collection.id]
    );
    const products = await Promise.all(rows.map(productToPublic));
    res.json({ ...collection, products });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/products', async (req, res) => {
  try {
    const result = await listProductsPublic({
      search: req.query.search as string,
      category: req.query.category as string,
      collection: req.query.collection as string,
      page: parseInt(req.query.page as string) || 1,
      perPage: parseInt(req.query.per_page as string) || 24
    });
    res.json({ data: result.items, meta: { total: result.total, page: result.page, per_page: result.perPage } });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/products/:slug', async (req, res) => {
  try {
    const product = await buildProductPublic(req.params.slug);
    if (!product) return jsonError(res, 'Product not found', 404);
    res.json(product);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/reviews/product/:id', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, customer_name, rating, comment, created_at FROM reviews WHERE product_id=? AND status=? ORDER BY created_at DESC',
      [parseInt(req.params.id), 'Approved']
    );
    const avg = (await query('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id=? AND status=?', [parseInt(req.params.id), 'Approved']))[0] as any;
    res.json({ average: Number(avg?.avg || 0), count: Number(avg?.count || 0), reviews: rows });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) return jsonError(res, 'Name, email and message are required', 400);
    const r = await execute('INSERT INTO messages (name, email, subject, body, status) VALUES (?,?,?,?,?)', [name, email, subject || 'Contact form', message, 'Unread']);
    res.status(201).json({ id: (r as any).insertId, status: 'Unread' });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

export default router;
