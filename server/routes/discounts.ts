import { Router } from 'express';
import { requireAuth, AuthRequest } from '../auth';
import { query, execute, jsonError } from '../config';
import { validateDiscount } from '../services/discounts';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM discounts ORDER BY id DESC');
    res.json(rows);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const b = req.body;
    if (!b.code || !['percentage', 'fixed'].includes(String(b.type).toLowerCase()) || Number(b.value) < 0) {
      return jsonError(res, 'Code, valid type, and non-negative value are required', 400);
    }
    const expires = b.expires_at ? new Date(b.expires_at).toISOString().slice(0, 19).replace('T', ' ') : null;
    const r = await execute(
      'INSERT INTO discounts (code, type, value, minimum_amount, usage_limit, per_customer_limit, expires_at, status) VALUES (?,?,?,?,?,?,?,?)',
      [String(b.code).trim().toUpperCase(), String(b.type).toLowerCase(), Number(b.value), Number(b.minimum_amount || 0), b.usage_limit || null, b.per_customer_limit || 1, expires, b.status || 'Active']
    );
    const row = (await query('SELECT * FROM discounts WHERE id=?', [(r as any).insertId]))[0];
    res.status(201).json(row);
  } catch (e: any) { jsonError(res, e.message.includes('Duplicate') ? 'That code already exists' : e.message, 400); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const row = (await query('SELECT * FROM discounts WHERE id=?', [parseInt(req.params.id as string)]))[0];
    if (!row) return jsonError(res, 'Not found', 404);
    res.json(row);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const b = req.body;
    if (!['percentage', 'fixed'].includes(String(b.type).toLowerCase()) || Number(b.value) < 0) {
      return jsonError(res, 'Valid type and non-negative value are required', 400);
    }
    const expires = b.expires_at ? new Date(b.expires_at).toISOString().slice(0, 19).replace('T', ' ') : null;
    await execute(
      'UPDATE discounts SET type=?, value=?, minimum_amount=?, usage_limit=?, per_customer_limit=?, expires_at=?, status=? WHERE id=?',
      [String(b.type).toLowerCase(), Number(b.value), Number(b.minimum_amount || 0), b.usage_limit || null, b.per_customer_limit || 1, expires, b.status || 'Active', parseInt(req.params.id as string)]
    );
    res.json((await query('SELECT * FROM discounts WHERE id=?', [parseInt(req.params.id as string)]))[0]);
  } catch (e: any) { jsonError(res, e.message, 400); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await execute('DELETE FROM discounts WHERE id=?', [parseInt(req.params.id as string)]);
    res.json({ success: true });
  } catch (e: any) { jsonError(res, e.message, 400); }
});

export default router;
