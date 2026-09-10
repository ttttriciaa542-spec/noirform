import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { query, JWT_SECRET } from './config';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: User): string {
  return jwt.sign({ uid: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });
}

export function getAuthUser(req: Request): User | null {
  const header = (req.headers.authorization || req.headers['x-authorization'] || '') as string;
  const match = /^Bearer\s+(.*)$/i.exec(header);
  if (!match) return null;
  try {
    const payload = jwt.verify(match[1], JWT_SECRET) as any;
    return { id: payload.uid, email: payload.email, name: payload.name || '', role: payload.role };
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return jsonError(res, 'Unauthenticated', 401);
  }
  req.user = user;
  next();
}

export function jsonError(res: Response, message: string, code = 400) {
  return res.status(code).json({ error: message });
}

export function paginateMeta(page: number, perPage: number, total: number) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  return { page: Math.max(1, Math.min(page, pages)), per_page: perPage, total, pages };
}
