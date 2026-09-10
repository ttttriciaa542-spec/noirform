import { Router } from 'express';
import { requireAuth } from '../auth';
import { query, execute, jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await query(`
      SELECT i.id AS variant_id, i.title AS variant, i.sku AS sku, i.inventory AS current_stock, i.is_active,
             p.id AS product_id, p.name AS product
      FROM product_variants i
      LEFT JOIN products p ON p.id = i.product_id
      ORDER BY p.name, i.id
    `);
    res.json(rows);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const variant = (await query('SELECT * FROM product_variants WHERE id=?', [parseInt(req.params.id as string)]))[0] as any;
    if (!variant) return jsonError(res, 'Variant not found', 404);
    const prev = Number(variant.inventory);
    const next = Number(req.body.quantity);
    if (!Number.isInteger(next) || next < 0) return jsonError(res, 'Quantity must be a non-negative whole number', 400);
    const reason = req.body.reason || 'Manual adjustment';
    await execute('UPDATE product_variants SET inventory=? WHERE id=?', [next, parseInt(req.params.id as string)]);
    await execute(
      'INSERT INTO inventory_adjustments (variant_id, previous_quantity, new_quantity, difference, reason, created_by) VALUES (?,?,?,?,?,?)',
      [parseInt(req.params.id as string), prev, next, next - prev, reason, (req as any).user?.name || 'admin']
    );
    res.json({ previous: prev, current: next, difference: next - prev });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

export default router;
