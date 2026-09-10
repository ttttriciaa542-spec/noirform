import { Router } from 'express';
import { requireAuth } from '../auth';
import { query, jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await query(`
      SELECT p.reference, p.amount, p.currency, p.status, p.method, p.paid_at, p.created_at,
             o.order_number, o.customer_name, o.email, o.total
      FROM payments p
      LEFT JOIN orders o ON o.id = p.order_id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

export default router;
