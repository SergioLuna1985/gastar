import { Hono } from 'hono';
import { createCategory, deleteCategory, listAdminCategories, listCategories, updateCategory } from '../controllers/categories.js';
import { requireAdmin } from '../middleware/auth.js';
import type { AppEnv } from '../types.js';

export const categoryRoutes = new Hono<AppEnv>();
categoryRoutes.get('/categories', listCategories);
categoryRoutes.get('/admin/categories', requireAdmin, listAdminCategories);
categoryRoutes.post('/admin/categories', requireAdmin, createCategory);
categoryRoutes.patch('/admin/categories/:id', requireAdmin, updateCategory);
categoryRoutes.delete('/admin/categories/:id', requireAdmin, deleteCategory);
