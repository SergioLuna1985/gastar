import { Hono } from 'hono';
import { createUser, listUsers } from '../controllers/users.js';
import { requireAdmin } from '../middleware/auth.js';
import type { AppEnv } from '../types.js';

export const userRoutes = new Hono<AppEnv>();
userRoutes.get('/users', listUsers);
userRoutes.post('/admin/users', requireAdmin, createUser);
