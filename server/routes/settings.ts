import { Router } from 'express';
import { requireAuth } from '../auth';
import { query, execute, jsonError } from '../config';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM settings ORDER BY category, id');
    res.json(rows);
  } catch (e) { jsonError(res, (e as Error).message, 500); }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : [req.body];
    for (const s of list) {
      await execute('INSERT INTO settings ("key", value, type, category) VALUES (?,?,?,?) ON CONFLICT ("key") DO UPDATE SET value=EXCLUDED.value, type=EXCLUDED.type, category=EXCLUDED.category',
        [s.key, s.value, s.type || 'Text', s.category || 'general']);
    }
    res.json(await query('SELECT * FROM settings ORDER BY category, id'));
  } catch (e: any) { jsonError(res, e.message, 400); }
});

router.put('/:key', requireAuth, async (req, res) => {
  try {
    await execute('INSERT INTO settings ("key", value, type, category) VALUES (?,?,?,?) ON CONFLICT ("key") DO UPDATE SET value=EXCLUDED.value, type=EXCLUDED.type',
      [req.params.key, req.body.value, req.body.type || 'Text', req.body.category || 'general']);
    res.json((await query('SELECT * FROM settings WHERE `key`=?', [req.params.key]))[0]);
  } catch (e: any) { jsonError(res, e.message, 400); }
});

export default router;
