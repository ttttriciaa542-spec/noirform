import { Router } from 'express';
import crypto from 'crypto';
import { query, execute, jsonError, TEST_MODE, APP_URL, PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY } from '../config';
import { finalizePaidOrder } from '../services/orders';
import { validateDiscount } from '../services/discounts';

const router = Router();

async function getSettings() {
  const rows = await query("SELECT `key`, value FROM settings WHERE `key` IN ('shipping_fee','free_shipping_threshold','currency_symbol')");
  const m: any = {};
  for (const r of rows) m[r.key] = r.value;
  return m;
}

function orderNumber() {
  const ts = String(Date.now()).slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NF-${ts}-${rand}`;
}

router.post('/checkout/initiate', async (req, res) => {
  try {
    const body = req.body || {};
    const { customer, items, discount_code } = body;
    if (!Array.isArray(items) || items.length === 0) return jsonError(res, 'Your cart is empty.', 400);
    if (!customer || !customer.email || !customer.name) return jsonError(res, 'Customer details are required.', 400);

    // Validate every variant + stock
    let subtotal = 0;
    const resolvedItems: any[] = [];
    for (const it of items) {
      const v = (await query('SELECT pv.*, p.name as product_name, p.price as product_price FROM product_variants pv JOIN products p ON p.id=pv.product_id WHERE pv.id=?', [it.variant_id]))[0] as any;
      if (!v || !v.is_active) return jsonError(res, `Selected variant is not available.`, 400);
      const qty = Math.max(1, parseInt(it.quantity || 1));
      if (v.inventory < qty) return jsonError(res, `${v.product_name} (${v.title}) only ${v.inventory} left in stock.`, 400);
      const unitPrice = Number(v.price) || Number(v.product_price) || 0;
      const line = unitPrice * qty;
      subtotal += line;
      resolvedItems.push({ variant_id: v.id, product_name: v.product_name, variant_title: v.title, sku: v.sku, quantity: qty, price: unitPrice, total: line });
    }

    const settings = await getSettings();
    const shippingFee = Number(settings.shipping_fee || 0);
    const freeThreshold = Number(settings.free_shipping_threshold || 0);

    const disc = await validateDiscount(discount_code || '', customer.email, subtotal);
    if (disc.error) return jsonError(res, disc.error, 400);

    let discountAmount = disc.amount || 0;
    let discountId: number | null = null;
    if (disc.discount) discountId = disc.discount.id;

    const after = subtotal - discountAmount;
    const shipping = after >= freeThreshold ? 0 : shippingFee;
    const total = Math.round((after + shipping) * 100) / 100;

    const ref = `nf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const orderNo = orderNumber();
    const r = await execute(
      `INSERT INTO orders (order_number, customer_name, email, phone, address, city, region,
       subtotal, discount_amount, shipping_fee, total, currency, status, payment_status, discount_id, reference)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [orderNo, customer.name, customer.email, customer.phone || '', customer.address || '', customer.city || '', customer.region || '',
       subtotal, discountAmount, shipping, total, 'GHS', 'Pending', 'Pending', discountId, ref]
    );
    const orderId = (r as any).insertId;
    for (const it of resolvedItems) {
      await execute(
        'INSERT INTO order_items (order_id, variant_id, product_name, variant_title, sku, quantity, price, total) VALUES (?,?,?,?,?,?,?,?)',
        [orderId, it.variant_id, it.product_name, it.variant_title, it.sku, it.quantity, it.price, it.total]
      );
    }

    const payload: any = {
      order_id: orderId, order_number: orderNo, reference: ref,
      subtotal, discount_amount: discountAmount, shipping_fee: shipping, total,
      paystack_public_key: PAYSTACK_PUBLIC_KEY || null, test_mode: TEST_MODE
    };

    if (!TEST_MODE && PAYSTACK_SECRET_KEY) {
      const psRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customer.email, amount: Math.round(total * 100), currency: 'GHS',
          reference: ref, callback_url: APP_URL,
          metadata: { order_id: orderId, order_number: orderNo }
        })
      });
      const psData: any = await psRes.json();
      if (psData.status && psData.data?.authorization_url) {
        payload.authorization_url = psData.data.authorization_url;
      } else {
        payload.paystack_error = psData.message;
      }
    }
    res.status(201).json(payload);
  } catch (e: any) {
    jsonError(res, e.message, 500);
  }
});

router.post('/paystack/verify', async (req, res) => {
  try {
    const { reference, order_id } = req.body || {};
    if (!reference) return jsonError(res, 'Reference is required', 400);
    const order = (await query('SELECT * FROM orders WHERE (reference=? OR id=?)', [reference, order_id || 0]))[0] as any;
    if (!order) return jsonError(res, 'Order not found', 404);

    if (order.payment_status === 'Paid') {
      return res.json({ status: 'paid', order_number: order.order_number });
    }

    let ok = false;
    if (TEST_MODE) {
      ok = true;
    } else if (PAYSTACK_SECRET_KEY) {
      const r = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
      });
      const data: any = await r.json();
      if (data.status && data.data?.status === 'success' && Number(data.data.amount) === Math.round(Number(order.total) * 100)) ok = true;
    }

    if (!ok) return jsonError(res, 'Payment verification failed', 402);

    const result = await finalizePaidOrder(Number(order.id), reference, Number(order.total));
    if ((result as any).error) return jsonError(res, (result as any).error, 409);
    res.json({ status: 'paid', order_number: order.order_number });
  } catch (e: any) {
    jsonError(res, e.message, 500);
  }
});

router.post('/paystack/webhook', async (req, res) => {
  try {
    const sig = req.headers['x-paystack-signature'] as string;
    const rawBuf: any = (req as any).rawBody;
    const rawBody = Buffer.isBuffer(rawBuf) ? rawBuf.toString() : (rawBuf ? String(rawBuf) : '');
    if (PAYSTACK_SECRET_KEY) {
      const expected = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
      if (!sig || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
        return jsonError(res, 'Invalid signature', 401);
      }
    }
    const body = rawBody ? JSON.parse(rawBody) : req.body;
    if (body.event === 'charge.success' && body.data?.reference) {
      const order = (await query('SELECT * FROM orders WHERE reference=?', [body.data.reference]))[0] as any;
      if (order && order.payment_status !== 'Paid') {
        await finalizePaidOrder(Number(order.id), body.data.reference, Number(order.total));
      }
    }
    res.json({ received: true });
  } catch (e: any) {
    jsonError(res, e.message, 400);
  }
});

export default router;
