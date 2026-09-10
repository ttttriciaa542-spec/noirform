const fs = require('fs');
const http = require('http');
const BASE = 'http://127.0.0.1:4000';

function req(path, opts = {}) {
  const options = { hostname: '127.0.0.1', port: 4000, path, method: opts.method || 'GET',
    headers: opts.headers || {} };
  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    if (opts.body) r.write(JSON.stringify(opts.body));
    r.end();
  });
}

(async () => {
  try {
    const login = (await req('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { email: 'owner@noirform.co', password: 'noir2026' } }));
    const token = login.body.token;
    const auth = { Authorization: 'Bearer ' + token };
    console.log('login:', login.status);

    // pre stock
    const inv = (await req('/api/admin/inventory', { headers: auth })).body;
    const v = inv.find(x => x.sku === 'NF-CD-001-IK-S');
    console.log('pre stock (CD-001-IK-S):', v && v.current_stock);

    // checkout
    const co = (await req('/api/checkout/initiate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: { customer: { name: 'E2E Buyer', email: 'buyer@test.com', phone: '+233 20 000 0001', city: 'Accra', region: 'Greater Accra', address: '12 Oxford St' },
        items: [{ variant_id: 1, quantity: 1 }], discount_code: 'WELCOME10' } })).body;
    console.log('checkout:', co.order_number, 'total', co.total, 'discount', co.discount_amount, 'test_mode', co.test_mode, 'auth_url?', !!co.authorization_url);

    // verify (test mode -> paid)
    const vf = (await req('/api/paystack/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { reference: co.reference, order_id: co.order_id } })).body;
    console.log('verify:', JSON.stringify(vf));

    // post stock
    const inv2 = (await req('/api/admin/inventory', { headers: auth })).body;
    const v2 = inv2.find(x => x.sku === 'NF-CD-001-IK-S');
    console.log('post stock (CD-001-IK-S):', v2 && v2.current_stock, '(was', v.current_stock + ' - 1)');

    // customer
    const cust = (await req('/api/admin/customers', { headers: auth })).body;
    const c = cust.find(x => x.email === 'buyer@test.com');
    console.log('customer:', c && c.name, 'orders', c && c.total_orders, 'spent', c && c.total_spent);

    // order
    const orders = (await req('/api/admin/orders?search=buyer', { headers: auth })).body;
    console.log('order:', orders.data[0] && orders.data[0].order_number, orders.data[0] && orders.data[0].payment_status, orders.data[0] && orders.data[0].status);

    // dashboard
    const dash = (await req('/api/admin/dashboard', { headers: auth })).body;
    console.log('dashboard: revenue', dash.revenue, 'orders', dash.orders, 'customers', dash.customers, 'bestsellers', (dash.bestsellers||[]).map(x=>x.name));
  } catch (e) { console.error('ERR', e); }
})();
