import { Router } from 'express';
import { requireAuth } from '../auth';
import { query, execute, jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM categories ORDER BY sort_order, name');
    const items = rows.map(r => ({ id: r.id, name: r.name, slug: r.slug, parent: r.parent_id, sort_order: r.sort_order }));
    for (const it of items) {
      (it as any).product_count = Number((await query('SELECT COUNT(*) as n FROM product_categories WHERE category_id=?', [it.id]))[0].n);
    }
    res.json(items);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const r = await execute('INSERT INTO categories (name, slug, parent_id, sort_order) VALUES (?,?,?,?)',
      [req.body.name, req.body.slug, req.body.parent_id || null, req.body.sort_order || 0]);
    res.status(201).json((await query('SELECT * FROM categories WHERE id=?', [(r as any).insertId]))[0]);
  } catch (e: any) { jsonError(res, e.message.includes('Duplicate') ? 'A category with that slug already exists' : e.message, 400); }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await execute('UPDATE categories SET name=?, slug=?, parent_id=?, sort_order=? WHERE id=?',
      [req.body.name, req.body.slug, req.body.parent_id || null, req.body.sort_order || 0, id]);
    res.json((await query('SELECT * FROM categories WHERE id=?', [id]))[0]);
  } catch (e: any) { jsonError(res, e.message, 400); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await execute('DELETE FROM categories WHERE id=?', [parseInt(req.params.id as string)]);
    res.json({ success: true });
  } catch (e: any) { jsonError(res, e.message, 400); }
});

export default router;
