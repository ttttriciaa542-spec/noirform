import { Router } from 'express';
import { requireAuth, AuthRequest } from '../auth';
import { fetchProductFull, listProductsAdmin, syncProduct, deleteProduct } from '../services/products';
import { jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await listProductsAdmin({
      search: req.query.search as string,
      status: req.query.status as string,
      page: parseInt(req.query.page as string) || 1,
      perPage: parseInt(req.query.per_page as string) || 20
    });
    res.json({ data: result.items, meta: { total: result.total, page: result.page, per_page: result.perPage } });
  } catch (e) {
    jsonError(res, (e as Error).message, 500);
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const product = await syncProduct(null, req.body);
    res.status(201).json(product);
  } catch (e) {
    jsonError(res, (e as Error).message, 500);
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const product = await fetchProductFull(parseInt(req.params.id));
    if (!product) return jsonError(res, 'Product not found', 404);
    res.json(product);
  } catch (e) {
    jsonError(res, (e as Error).message, 500);
  }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const product = await syncProduct(parseInt(req.params.id), req.body);
    res.json(product);
  } catch (e) {
    jsonError(res, (e as Error).message, 500);
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await deleteProduct(parseInt(req.params.id));
    res.json({ success: true });
  } catch (e) {
    jsonError(res, (e as Error).message, 500);
  }
});

export default router;
