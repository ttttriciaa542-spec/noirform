import { Pool, PoolClient, QueryResult } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

export const DB_HOST = process.env.DB_HOST || '127.0.0.1';
export const DB_NAME = process.env.DB_NAME || 'noirform';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASS = process.env.DB_PASS || '';
export const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-change-me-in-production';
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
export const APP_URL = (process.env.APP_URL || 'http://localhost:5175').replace(/\/$/, '');
export const PORT = parseInt(process.env.PORT || '4000', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const TEST_MODE = !PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY.trim() === '' || PAYSTACK_SECRET_KEY.includes('REPLACE');

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
export const UPLOAD_BASE = '/uploads';
export const UPLOAD_URL = (req: { protocol: string; get: (h: string) => string | undefined }) => '';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function postgresSql(sql: string, params: any[]) {
  let index = 0;
  const text = sql
    .replace(/`([^`]+)`/g, '"$1"')
    .replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT INTO')
    .replace(/\?/g, () => `$${++index}`);
  const withConflictHandling = /INSERT INTO/i.test(text) && /INSERT\s+INTO\s+product_(categories|collections)/i.test(text)
    ? `${text} ON CONFLICT DO NOTHING`
    : text;
  return { text: withConflictHandling, values: params };
}

async function runQuery(client: { query: (query: any) => Promise<QueryResult<any>> }, sql: string, params: any[] = []) {
  const normalized = postgresSql(sql, params);
  const returning = /^\s*INSERT\s/i.test(normalized.text) && !/\bRETURNING\b/i.test(normalized.text);
  return client.query({
    text: returning ? `${normalized.text} RETURNING id` : normalized.text,
    values: normalized.values
  });
}

class DatabaseConnection {
  constructor(private readonly client: PoolClient) {}
  async beginTransaction() { await this.client.query('BEGIN'); }
  async commit() { await this.client.query('COMMIT'); }
  async rollback() { await this.client.query('ROLLBACK'); }
  async execute(sql: string, params: any[] = []) {
    const result = await runQuery(this.client, sql, params);
    return [result.rows, { insertId: result.rows[0]?.id, affectedRows: result.rowCount }];
  }
  release() { this.client.release(); }
}

class DatabasePool {
  private readonly pool = new Pool({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS, database: DB_NAME });
  async query(sql: string, params: any[] = []) { return runQuery(this.pool, sql, params); }
  async execute(sql: string, params: any[] = []) {
    const result = await runQuery(this.pool, sql, params);
    return [{ insertId: result.rows[0]?.id, affectedRows: result.rowCount, rows: result.rows }, { insertId: result.rows[0]?.id, affectedRows: result.rowCount }];
  }
  async getConnection() { return new DatabaseConnection(await this.pool.connect()); }
}

export const pool = new DatabasePool();

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const result = await pool.query(sql, params);
  return result.rows as any[];
}

export async function execute(sql: string, params: any[] = []): Promise<any> {
  const [result] = await pool.execute(sql, params);
  return result;
}

export function jsonError(res: any, message: string, code = 400, extra: any = null) {
  const payload: any = { error: message };
  if (extra) payload.errors = extra;
  return res.status(code).json(payload);
}

export function uploadedUrl(filename: string) {
  return `${UPLOAD_BASE}/${filename}`;
}
