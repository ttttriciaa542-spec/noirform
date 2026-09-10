import { Router } from 'express';
import { requireAuth } from '../auth';
import { query, execute, jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    let where = 'WHERE 1=1'; const params: any[] = [];
    if (req.query.status) { where += ' AND status = ?'; params.push(req.query.status); }
    if (req.query.product_id) { where += ' AND product_id = ?'; params.push(parseInt(req.query.product_id as string)); }
    const rows = await query(`SELECT r.*, p.name as product FROM reviews r LEFT JOIN products p ON p.id=r.product_id ${where} ORDER BY r.id DESC`, params);
    res.json(rows);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const row = (await query('SELECT r.*, p.name as product FROM reviews r LEFT JOIN products p ON p.id=r.product_id WHERE r.id=?', [parseInt(req.params.id as string)]))[0];
    if (!row) return jsonError(res, 'Not found', 404);
    res.json(row);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const r = await execute('INSERT INTO reviews (product_id, customer_name, rating, comment, status) VALUES (?,?,?,?,?)',
      [req.body.product_id, req.body.customer_name, req.body.rating, req.body.comment, req.body.status || 'Pending']);
    res.status(201).json((await query('SELECT * FROM reviews WHERE id=?', [(r as any).insertId]))[0]);
  } catch (e: any) { jsonError(res, e.message, 400); }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    await execute('UPDATE reviews SET status = COALESCE(?, status), rating = COALESCE(?, rating), comment = COALESCE(?, comment) WHERE id=?',
      [req.body.status, req.body.rating, req.body.comment, parseInt(req.params.id as string)]);
    res.json((await query('SELECT * FROM reviews WHERE id=?', [parseInt(req.params.id as string)]))[0]);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await execute('DELETE FROM reviews WHERE id=?', [parseInt(req.params.id as string)]);
    res.json({ success: true });
  } catch (e: any) { jsonError(res, e.message, 400); }
});

export default router;
