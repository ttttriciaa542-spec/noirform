import { query, execute, pool } from '../config';
import { bestSellers } from './products';

export interface OrderItem {
  id: number;
  product_name: string;
  variant_title: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export async function fetchOrder(id: number): Promise<any> {
  const order = (await query('SELECT * FROM orders WHERE id = ?', [id]))[0] as any;
  if (!order) return null;
  const items = await query(
    `SELECT oi.*, pv.title as variant_title, pv.sku as variant_sku, p.name as product_name
     FROM order_items oi
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     LEFT JOIN products p ON p.id = pv.product_id
     WHERE oi.order_id = ?`,
    [id]
  );
  return { ...order, items };
}

export async function listOrders(opts: { status?: string; search?: string; page?: number; perPage?: number }) {
  const params: any[] = [];
  let where = 'WHERE 1=1';
  if (opts.status && opts.status !== 'All') {
    where += ' AND status = ?';
    params.push(opts.status);
  }
  if (opts.search) {
    where += ' AND (order_number LIKE ? OR customer_name LIKE ? OR email LIKE ?)';
    const q = `%${opts.search}%`;
    params.push(q, q, q);
  }
  const perPage = Math.max(1, parseInt(opts.perPage || '20', 10));
  const page = Math.max(1, parseInt(opts.page || '1', 10));
  const total = (await query(`SELECT COUNT(*) as n FROM orders ${where}`, params))[0] as any;
  const rows = await query(`SELECT * FROM orders ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, perPage, (page - 1) * perPage]);
  return { items: rows, total: Number((total as any).n), page, perPage };
}

export async function updateOrderStatus(id: number, payload: { status?: string; payment_status?: string }) {
  const sets: string[] = [];
  const params: any[] = [];
  if (payload.status !== undefined) { sets.push('status = ?'); params.push(payload.status); }
  if (payload.payment_status !== undefined) { sets.push('payment_status = ?'); params.push(payload.payment_status); }
  if (sets.length === 0) return fetchOrder(id);
  await execute(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  return fetchOrder(id);
}

export async function finalizePaidOrder(orderId: number, reference: string, amount: number | null = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const order = (await conn.execute('SELECT * FROM orders WHERE id = ?', [orderId]))[0] as any;
    if (!order) { await conn.rollback(); conn.release(); return { error: 'Order not found' }; }
    if (order.payment_status === 'Paid') { await conn.commit(); conn.release(); return { already: true }; }
    console.error('[finalize] orderId', orderId, 'amount', amount, 'order.total', order.total, 'eq', amount !== null && Number(amount) !== Number(order.total));
    // amount guard (when provided by a real gateway)
    if (amount !== null && Number(amount) !== Number(order.total)) {
      await conn.rollback();
      conn.release();
      return { error: 'Amount mismatch', debug: { amount, order_total: order.total, cmp: Number(amount) === Number(order.total) } };
    }
    // payment record
    await conn.execute(
      'INSERT INTO payments (order_id, provider, amount, currency, reference, status, method, paid_at) VALUES (?,?,?,?,?,?,?,NOW())',
      [orderId, 'Paystack', order.total, order.currency, reference, 'Paid', 'card']
    );
    // update order to paid + processing fulfillment
    await conn.execute('UPDATE orders SET payment_status = ?, status = ?, updated_at = NOW() WHERE id = ?', ['Paid', 'Processing', orderId]);
    // customer record (guest -> consolidated)
    const cust = (await conn.execute('SELECT * FROM customers WHERE email = ?', [order.email]))[0] as any;
    if (cust) {
      await conn.execute(
        'UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?',
        [order.customer_name, order.phone, order.total, cust.id]
      );
      await conn.execute('UPDATE orders SET customer_id = ? WHERE id = ?', [cust.id, orderId]);
    } else {
      const cr = await conn.execute(
        'INSERT INTO customers (email, name, phone, address, city, region, total_orders, total_spent) VALUES (?,?,?,?,?,?,1,?)',
        [order.email, order.customer_name, order.phone, order.address, order.city, order.region, order.total]
      );
      await conn.execute('UPDATE orders SET customer_id = ? WHERE id = ?', [(cr as any).insertId, orderId]);
    }
    // decrement variant inventory from line items
    const items = await conn.execute(
      'SELECT id, variant_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    ) as any[];
    for (const it of items) {
      if (it.variant_id) {
        const v = (await conn.execute('SELECT inventory FROM product_variants WHERE id = ?', [it.variant_id]))[0] as any;
        const prev = Number(v?.inventory || 0);
        const next = Math.max(0, prev - Number(it.quantity));
        await conn.execute('UPDATE product_variants SET inventory = ? WHERE id = ?', [next, it.variant_id]);
        await conn.execute(
          'INSERT INTO inventory_adjustments (variant_id, previous_quantity, new_quantity, difference, reason, created_by) VALUES (?,?,?,?,?,?)',
          [it.variant_id, prev, next, next - prev, 'Sale (order #' + order.order_number + ')', 'system']
        );
      }
    }
    // discount usage accounting
    if (order.discount_id) {
      await conn.execute('UPDATE discounts SET used_count = used_count + 1 WHERE id = ?', [order.discount_id]);
      await conn.execute('INSERT INTO discount_usages (discount_id, order_id, customer_email) VALUES (?,?,?)', [order.discount_id, orderId, order.email]);
    }
    await conn.commit();
    return { success: true };
  } catch (e) {
    await conn.rollback();
    return { error: (e as Error).message };
  } finally {
    conn.release();
  }
}

export async function recentOrders(limit = 5) {
  return query('SELECT * FROM orders ORDER BY id DESC LIMIT ?', [limit]) as Promise<any[]>;
}

export async function dashboardStats() {
  const paidOrders = await query("SELECT COUNT(*) as n FROM orders WHERE payment_status='Paid'") as any[];
  const revenue = await query("SELECT SUM(total) as sum FROM orders WHERE payment_status='Paid'") as any[];
  const pending = await query("SELECT COUNT(*) as n FROM orders WHERE status='Pending'") as any[];
  const customers = await query("SELECT COUNT(DISTINCT email) as n FROM orders WHERE email IS NOT NULL") as any[];
  const productCount = await query('SELECT COUNT(*) as n FROM products') as any[];
  const lowStock = await query('SELECT COUNT(*) as n FROM product_variants WHERE inventory > 0 AND inventory < 5') as any[];
  const outStock = await query('SELECT COUNT(*) as n FROM product_variants WHERE inventory = 0') as any[];
  return {
    revenue: Number(revenue[0]?.sum || 0),
    orders: Number(paidOrders[0]?.n || 0),
    pending: Number(pending[0]?.n || 0),
    customers: Number(customers[0]?.n || 0),
    products: Number(productCount[0]?.n || 0),
    low_stock: Number(lowStock[0]?.n || 0),
    out_of_stock: Number(outStock[0]?.n || 0),
    bestsellers: await bestSellers(4)
  };
}
