import { Router } from 'express';
import { signToken, verifyPassword, requireAuth, AuthRequest } from '../auth';
import { query, jsonError } from '../config';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = (await query('SELECT * FROM users WHERE email = ?', [email || '']))[0] as any;
  if (!user || !verifyPassword(password || '', user.password)) {
    return jsonError(res, 'Invalid owner email or password.', 401);
  }
  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', requireAuth, (req: AuthRequest, res) => res.json({ user: req.user }));

router.post('/logout', requireAuth, (_req, res) => res.json({ message: 'Logged out' }));

export default router;
