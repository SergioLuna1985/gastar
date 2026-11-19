# Gastando: notas para agentes

## Desarrollo y verificación

- Monorepo npm con workspaces `backend` y `frontend`. Desde la raíz: `npm install`, `npm run dev` o `npm run build`. La compilación del backend solo verifica tipos; la del frontend ejecuta TypeScript y Vite. Para verificar uno: `npm run build -w backend` o `npm run build -w frontend`.
- No hay scripts de tests ni lint configurados. Las operaciones de migración y seed requieren PostgreSQL y `DATABASE_URL`.
- En desarrollo local, copiar `.env.example` a `backend/.env`: los scripts del workspace backend se ejecutan desde ese directorio y allí carga dotenv. Ejecutar `npm run db:migrate`, luego `npm run seed`, antes de `npm run dev`.
- Docker Compose usa `.env` en la raíz, espera a PostgreSQL y ejecuta migración y seed al iniciar el backend. Conserva la base en el volumen `postgres_data`; no eliminarlo sin autorización. Para detalles de arranque y credenciales de desarrollo, ver `README.md` y `docker-compose.yml`.
- Tras cambiar `backend/src/schema.ts`, generar migraciones con `npm run db:generate`; Drizzle guarda SQL y metadatos en `backend/drizzle`. `npm run db:migrate` aplica esas migraciones, no genera otras.

## Arquitectura y reglas importantes

- `backend/src/index.ts` configura Hono y monta `routes/`; los manejadores y consultas están en `controllers/`, y los controles de sesión, origen y rol en `middleware/auth.ts`. `backend/src/auth.ts` configura Better Auth y deshabilita el registro público. Las tablas de autenticación y de la aplicación comparten `backend/src/schema.ts`.
- `frontend/src/main.tsx` concentra la interfaz, cliente de autenticación y consultas. Vite redirige `/api` al backend; `API_PROXY_TARGET` cambia el destino dentro de Docker. Los cambios de URL deben coordinarse con `FRONTEND_URL`, `BETTER_AUTH_URL` y los orígenes permitidos.
- Los importes de API y base son **centavos enteros**, no pesos decimales. Las fechas se muestran en `America/Argentina/Buenos_Aires`; el cálculo del mes familiar usa actualmente el desplazamiento UTC-3 explícito.
- La lista personal devuelve los últimos cinco gastos sin filtro mensual; la vista familiar filtra por mes sin borrar datos históricos. Editar o borrar gastos está restringido al propietario. Eliminar una categoría la desactiva para conservar las referencias históricas.
- El seed crea categorías solo si la tabla está vacía y crea el administrador solo si el correo configurado no existe; cambiar las variables de administrador no actualiza una cuenta ya creada.
