import { Router } from 'express';
import { requireAuth } from '../auth';
import { query, execute, jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    let where = 'WHERE 1=1'; const params: any[] = [];
    if (req.query.status) { where += ' AND status = ?'; params.push(req.query.status); }
    if (req.query.search) { where += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)'; const q = `%${req.query.search}%`; params.push(q, q, q); }
    const rows = await query(`SELECT * FROM messages ${where} ORDER BY id DESC`, params);
    res.json(rows);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const row = (await query('SELECT * FROM messages WHERE id=?', [parseInt(req.params.id as string)]))[0];
    if (!row) return jsonError(res, 'Not found', 404);
    res.json(row);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    await execute('UPDATE messages SET status = COALESCE(?, status), subject = COALESCE(?, subject), body = COALESCE(?, body) WHERE id=?',
      [req.body.status, req.body.subject, req.body.body, parseInt(req.params.id as string)]);
    res.json((await query('SELECT * FROM messages WHERE id=?', [parseInt(req.params.id as string)]))[0]);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await execute('DELETE FROM messages WHERE id=?', [parseInt(req.params.id as string)]);
    res.json({ success: true });
  } catch (e: any) { jsonError(res, e.message, 400); }
});

export default router;
