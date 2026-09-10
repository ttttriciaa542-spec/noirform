import { Router } from 'express';
import { requireAuth } from '../auth';
import { dashboardStats, recentOrders } from '../services/orders';
import { jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const stats = await dashboardStats();
    const recent = await recentOrders(8);
    res.json({
      revenue: stats.revenue,
      orders: stats.orders,
      customers: stats.customers,
      products: stats.products,
      pending: stats.pending,
      low_stock: stats.low_stock,
      out_of_stock: stats.out_of_stock,
      bestsellers: stats.bestsellers,
      recent_orders: recent
    });
  } catch (e) {
    jsonError(res, (e as Error).message, 500);
  }
});

export default router;
