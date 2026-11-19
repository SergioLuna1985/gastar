import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db.js';
import { categories } from '../schema.js';
import type { AppEnv } from '../types.js';
import { idParam } from './utils.js';

const categoryInput = z.object({ name: z.string().trim().min(1).max(100), group: z.enum(['Fijos', 'Variables', 'Discrecionales']) });

export const listCategories = async (c: Context<AppEnv>) => c.json(await db.select().from(categories).where(eq(categories.active, true)).orderBy(categories.name));

export const listAdminCategories = async (c: Context<AppEnv>) => c.json(await db.select().from(categories).orderBy(categories.name));

export const createCategory = async (c: Context<AppEnv>) => {
  const input = categoryInput.safeParse(await c.req.json().catch(() => null));
  if (!input.success) return c.json({ error: 'Categoría inválida' }, 400);
  const [result] = await db.insert(categories).values(input.data).returning();
  return c.json(result, 201);
};

export const updateCategory = async (c: Context<AppEnv>) => {
  const input = categoryInput.safeParse(await c.req.json().catch(() => null));
  if (!input.success) return c.json({ error: 'Categoría inválida' }, 400);
  const [result] = await db.update(categories).set(input.data).where(eq(categories.id, idParam(c.req.param('id')!))).returning();
  return result ? c.json(result) : c.json({ error: 'Categoría no encontrada' }, 404);
};

export const deleteCategory = async (c: Context<AppEnv>) => {
  const [result] = await db.update(categories).set({ active: false }).where(eq(categories.id, idParam(c.req.param('id')!))).returning();
  return result ? c.json(result) : c.json({ error: 'Categoría no encontrada' }, 404);
};
