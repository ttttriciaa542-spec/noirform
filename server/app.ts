import express from 'express';
import cors from 'cors';
import path from 'path';
import { APP_URL, UPLOAD_DIR, PORT } from './config';
import { requireAuth } from './auth';
import authRoutes from './routes/auth';
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import collectionsRouter from './routes/collections';
import ordersRouter from './routes/orders';
import customersRouter from './routes/customers';
import discountsRouter from './routes/discounts';
import reviewsRouter from './routes/reviews';
import messagesRouter from './routes/messages';
import settingsRouter from './routes/settings';
import inventoryRouter from './routes/inventory';
import paymentsRouter from './routes/payments';
import uploadsRouter from './routes/uploads';
import dashboardRouter from './routes/dashboard';
import storefrontRouter from './routes/storefront';
import checkoutRouter from './routes/checkout';

const app = express();

const allowOrigin = [APP_URL, 'http://localhost:5175', 'http://127.0.0.1:5175', 'http://localhost:4000', 'http://127.0.0.1:4000'];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowOrigin.includes(origin) ? origin : allowOrigin[0]),
  credentials: true
}));
app.use(express.json({ limit: '10mb', verify: (req, _res, buf) => { (req as any).rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Public / storefront
app.use('/api', storefrontRouter);
app.use('/api', checkoutRouter);
app.use('/api/auth', authRoutes);

// Admin (protected)
const admin = express.Router();
admin.use(requireAuth);
admin.use('/products', productsRouter);
admin.use('/categories', categoriesRouter);
admin.use('/collections', collectionsRouter);
admin.use('/orders', ordersRouter);
admin.use('/customers', customersRouter);
admin.use('/discounts', discountsRouter);
admin.use('/reviews', reviewsRouter);
admin.use('/messages', messagesRouter);
admin.use('/settings', settingsRouter);
admin.use('/inventory', inventoryRouter);
admin.use('/payments', paymentsRouter);
admin.use('/uploads', uploadsRouter);
admin.use('/dashboard', dashboardRouter);
app.use('/api/admin', admin);

// Serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve the production Vite bundle from the same Railway service as the API.
const DIST_DIR = path.join(process.cwd(), 'dist');
app.use(express.static(DIST_DIR));
app.get('/', (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
app.get('/admin.html', (_req, res) => res.sendFile(path.join(DIST_DIR, 'admin.html')));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler for API
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
