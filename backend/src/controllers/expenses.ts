import type { Context } from 'hono';
import { and, desc, eq, gte, lt } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db.js';
import { categories, expenses, user } from '../schema.js';
import type { AppEnv } from '../types.js';
import { idParam } from './utils.js';

const expenseInput = z.object({ categoryId: z.number().int().positive(), amount: z.number().int().positive().max(2147483647) });
const expenseSelection = { id: expenses.id, amount: expenses.amount, categoryId: expenses.categoryId, category: categories.name, group: categories.group, createdAt: expenses.createdAt, userId: expenses.userId, userName: user.name };

export const listMyExpenses = async (c: Context<AppEnv>) => c.json(await db.select(expenseSelection).from(expenses).innerJoin(categories, eq(expenses.categoryId, categories.id)).innerJoin(user, eq(expenses.userId, user.id)).where(eq(expenses.userId, c.get('identity').id)).orderBy(desc(expenses.createdAt), desc(expenses.id)).limit(5));

export const listFamilyExpenses = async (c: Context<AppEnv>) => {
  // Buenos Aires currently uses UTC-3; derive the calendar month in its IANA zone.
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
  const year = Number(parts.find(p => p.type === 'year')!.value), month = Number(parts.find(p => p.type === 'month')!.value);
  const start = new Date(Date.UTC(year, month - 1, 1, 3)), end = new Date(Date.UTC(year, month, 1, 3));
  const selectedUser = c.req.query('userId');
  const conditions = [gte(expenses.createdAt, start), lt(expenses.createdAt, end)];
  if (selectedUser) conditions.push(eq(expenses.userId, selectedUser));
  const rows = await db.select(expenseSelection).from(expenses).innerJoin(categories, eq(expenses.categoryId, categories.id)).innerJoin(user, eq(expenses.userId, user.id)).where(and(...conditions));
  const totals = new Map<number, { category: string; amount: number }>();
  for (const row of rows) { const previous = totals.get(row.categoryId); totals.set(row.categoryId, { category: row.category, amount: (previous?.amount || 0) + row.amount }); }
  return c.json({ total: rows.reduce((sum, row) => sum + row.amount, 0), categories: [...totals.values()].sort((a, b) => b.amount - a.amount), month, year });
};

export const createExpense = async (c: Context<AppEnv>) => {
  const input = expenseInput.safeParse(await c.req.json().catch(() => null));
  if (!input.success) return c.json({ error: 'Ingresá una categoría y un importe válido' }, 400);
  const [category] = await db.select().from(categories).where(and(eq(categories.id, input.data.categoryId), eq(categories.active, true)));
  if (!category) return c.json({ error: 'La categoría no está disponible' }, 400);
  const [result] = await db.insert(expenses).values({ ...input.data, userId: c.get('identity').id }).returning();
  return c.json(result, 201);
};

export const updateExpense = async (c: Context<AppEnv>) => {
  const input = expenseInput.safeParse(await c.req.json().catch(() => null));
  if (!input.success) return c.json({ error: 'Ingresá una categoría y un importe válido' }, 400);
  const [category] = await db.select().from(categories).where(and(eq(categories.id, input.data.categoryId), eq(categories.active, true)));
  if (!category) return c.json({ error: 'La categoría no está disponible' }, 400);
  const [result] = await db.update(expenses).set(input.data).where(and(eq(expenses.id, idParam(c.req.param('id')!)), eq(expenses.userId, c.get('identity').id))).returning();
  return result ? c.json(result) : c.json({ error: 'Gasto no encontrado' }, 404);
};

export const deleteExpense = async (c: Context<AppEnv>) => {
  const [result] = await db.delete(expenses).where(and(eq(expenses.id, idParam(c.req.param('id')!)), eq(expenses.userId, c.get('identity').id))).returning();
  return result ? c.json({ ok: true }) : c.json({ error: 'Gasto no encontrado' }, 404);
};
