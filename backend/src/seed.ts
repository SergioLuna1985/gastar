import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { auth } from './auth.js';
import { db, client } from './db.js';
import { categories, user } from './schema.js';
const initial: Record<string, string[]> = { Fijos: ['Vivienda', 'Servicios básicos', 'Salud', 'Educación', 'Seguros y préstamos'], Variables: ['Alimentación y supermercado', 'Transporte y movilidad', 'Indumentaria y calzado', 'Cuidado personal'], Discrecionales: ['Entretenimiento y salidas', 'Suscripciones digitales', 'Regalos y celebraciones'] };
if (!(await db.select().from(categories).limit(1)).length) await db.insert(categories).values(Object.entries(initial).flatMap(([group, names]) => names.map(name => ({ group, name }))));
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
if (ADMIN_EMAIL && ADMIN_PASSWORD && !(await db.select().from(user).where(eq(user.email, ADMIN_EMAIL)).limit(1)).length) {
  await auth.api.createUser({ body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME || 'Administrador', role: 'admin' } });
  console.log('Administrador inicial creado');
}
await client.end();
