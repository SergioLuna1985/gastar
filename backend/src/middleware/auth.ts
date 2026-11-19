import { createMiddleware } from 'hono/factory';
import { auth } from '../auth.js';
import type { AppEnv } from '../types.js';

export const requireSession = (frontend: string) => createMiddleware<AppEnv>(async (c, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method) && c.req.header('origin') !== frontend) return c.json({ error: 'Origen no permitido' }, 403);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Iniciá sesión para continuar' }, 401);
  c.set('identity', session.user);
  await next();
});

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get('identity').role !== 'admin') return c.json({ error: 'Sin permiso' }, 403);
  await next();
});
