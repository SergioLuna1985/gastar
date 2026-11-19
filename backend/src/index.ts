import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth.js';
import { requireSession } from './middleware/auth.js';
import { categoryRoutes } from './routes/categories.js';
import { expenseRoutes } from './routes/expenses.js';
import { userRoutes } from './routes/users.js';
import type { AppEnv } from './types.js';

const app = new Hono<AppEnv>();
const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use('*', cors({ origin: frontend, credentials: true, allowHeaders: ['Content-Type'], allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.on(['POST', 'GET'], '/api/auth/*', c => auth.handler(c.req.raw));
app.use('/api/*', requireSession(frontend));
app.route('/api', categoryRoutes);
app.route('/api', expenseRoutes);
app.route('/api', userRoutes);
app.onError((error, c) => { console.error(error); return c.json({ error: 'Ocurrió un error inesperado' }, 500); });

serve({ fetch: app.fetch, port: Number(process.env.PORT || 3000), hostname: '0.0.0.0' }, info => console.log(`API en puerto ${info.port}`));
