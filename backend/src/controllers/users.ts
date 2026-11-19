import type { Context } from 'hono';
import { z } from 'zod';
import { auth } from '../auth.js';
import { db } from '../db.js';
import { user } from '../schema.js';
import type { AppEnv } from '../types.js';

export const listUsers = async (c: Context<AppEnv>) => c.json(await db.select({ id: user.id, name: user.name }).from(user).orderBy(user.name));

export const createUser = async (c: Context<AppEnv>) => {
  const input = z.object({ name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(255), password: z.string().min(8).max(128) }).safeParse(await c.req.json().catch(() => null));
  if (!input.success) return c.json({ error: 'Revisá los datos; la contraseña debe tener al menos 8 caracteres' }, 400);
  try { await auth.api.createUser({ body: { ...input.data, email: input.data.email.toLowerCase(), role: 'user' } }); return c.json({ ok: true }, 201); }
  catch { return c.json({ error: 'No se pudo crear la cuenta. Verificá que el correo no esté registrado.' }, 400); }
};
