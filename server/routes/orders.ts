import { Router } from 'express';
import { requireAuth, AuthRequest } from '../auth';
import { fetchOrder, listOrders, updateOrderStatus } from '../services/orders';
import { execute, query, jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await listOrders({
      status: req.query.status as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      perPage: parseInt(req.query.per_page as string) || 20
    });
    res.json({ data: result.items, meta: { total: result.total, page: result.page, per_page: result.perPage } });
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await fetchOrder(parseInt(req.params.id));
    if (!order) return jsonError(res, 'Order not found', 404);
    res.json(order);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.patch('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await updateOrderStatus(parseInt(req.params.id), {
      status: req.body.status,
      payment_status: req.body.payment_status
    });
    res.json(order);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await execute('DELETE FROM orders WHERE id=?', [parseInt(req.params.id)]);
    res.json({ success: true });
  } catch (e: any) { jsonError(res, e.message, 400); }
});

export default router;
