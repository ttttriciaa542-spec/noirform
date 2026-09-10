import { Router } from 'express';
import { requireAuth } from '../auth';
import { query, execute, jsonError } from '../config';

const router = Router();

async function collectionRow(c: any) {
  const productCount = (await query('SELECT COUNT(*) as n FROM product_collections WHERE collection_id=?', [c.id]))[0] as any;
  return {
    id: c.id, title: c.title, slug: c.slug, description: c.description,
    image: c.image, published: !!c.published, sort_order: c.sort_order,
    product_count: Number(productCount?.n || 0)
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM collections ORDER BY sort_order, title');
    const items = await Promise.all(rows.map(collectionRow));
    res.json(items);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const b = req.body;
    const r = await execute(
      'INSERT INTO collections (title, slug, description, image, published, sort_order) VALUES (?,?,?,?,?,?)',
      [b.title, b.slug, b.description || null, b.image || null, !!b.published, b.sort_order || 0]
    );
    res.status(201).json(await collectionRow({ id: (r as any).insertId, ...b }));
  } catch (e: any) { jsonError(res, e.message.includes('Duplicate') ? 'A collection with that slug already exists' : e.message, 400); }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await execute(
      'UPDATE collections SET title=?, slug=?, description=?, image=?, published=?, sort_order=? WHERE id=?',
      [req.body.title, req.body.slug, req.body.description || null, req.body.image || null, !!req.body.published, req.body.sort_order || 0, id]
    );
    res.json(await collectionRow((await query('SELECT * FROM collections WHERE id=?', [id]))[0]));
  } catch (e: any) { jsonError(res, e.message, 400); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await execute('DELETE FROM collections WHERE id=?', [parseInt(req.params.id as string)]);
    res.json({ success: true });
  } catch (e: any) { jsonError(res, e.message, 400); }
});

export default router;
