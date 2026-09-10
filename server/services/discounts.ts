import { query } from '../config';

export async function validateDiscount(code: string, email: string, subtotal: number) {
  if (!code) return { discount: null, amount: 0 };
  const d = (await query('SELECT * FROM discounts WHERE code = ?', [code.toUpperCase()]))[0] as any;
  if (!d) return { error: 'That discount code does not exist.' };
  if (d.status !== 'Active') return { error: 'This discount code is not active.' };
  if (d.expires_at && new Date(d.expires_at) < new Date()) return { error: 'This discount code has expired.' };
  if (d.minimum_amount && subtotal < Number(d.minimum_amount)) return { error: `Minimum spend is GHS ${d.minimum_amount}.` };
  if (d.usage_limit && Number(d.used_count) >= Number(d.usage_limit)) return { error: 'This discount code has been used up.' };
  if (d.per_customer_limit) {
    const used = (await query('SELECT COUNT(*) as n FROM discount_usages WHERE discount_id=? AND customer_email=?', [d.id, email]))[0] as any;
    if (Number(used.n) >= Number(d.per_customer_limit)) return { error: 'You have already used this discount.' };
  }
  let amount = 0;
  if (d.type === 'percentage') amount = subtotal * (Number(d.value) / 100);
  else amount = Math.min(Number(d.value), subtotal);
  amount = Math.round(amount * 100) / 100;
  return { discount: d, amount };
}
