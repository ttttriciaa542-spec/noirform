import { Router } from 'express';
import { requireAuth } from '../auth';
import { query, jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const params: any[] = [];
    let where = 'WHERE 1=1';
    if (req.query.search) { where += ' AND (email LIKE ? OR name LIKE ? OR phone LIKE ?)'; params.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`); }
    const customers = await query(`SELECT * FROM customers ${where} ORDER BY total_spent DESC, id DESC`, params);
    // order history per customer
    const result = await Promise.all(customers.map(async (c: any) => {
      const orders = await query('SELECT id, order_number, total, status, payment_status, created_at FROM orders WHERE customer_id=? ORDER BY id DESC', [c.id]);
      return { ...c, orders };
    }));
    res.json(result);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const customer = (await query('SELECT * FROM customers WHERE id=?', [parseInt(req.params.id)]))[0] as any;
    if (!customer) return jsonError(res, 'Customer not found', 404);
    const orders = await query('SELECT id, order_number, total, status, payment_status, created_at FROM orders WHERE customer_id=? ORDER BY id DESC', [customer.id]);
    res.json({ ...customer, orders });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

export default router;
