# Gastando

Aplicación web familiar para registrar gastos en pesos argentinos. Las fechas y el cambio de mes se interpretan en la zona horaria de Buenos Aires.

## Inicio con Docker

1. Copiá `.env.example` como `.env` en la raíz.
2. Cambiá `BETTER_AUTH_SECRET` por un secreto aleatorio de al menos 32 caracteres y elegí `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 8 caracteres) y `ADMIN_NAME`.
3. Ejecutá `docker compose up --build`.
4. Abrí <http://localhost:5173> e iniciá sesión con la cuenta administradora. Desde Administración podés crear las cuentas de tu familia.

La primera ejecución crea las tablas y categorías iniciales. PostgreSQL conserva los datos en el volumen `postgres_data`. No elimines el volumen si querés conservar los gastos.

## Desarrollo local

Con Node.js 22 o superior y PostgreSQL disponible, instalá dependencias con `npm install`. Copiá `.env.example` a `backend/.env` y configurá sus valores. Luego ejecutá `npm run db:migrate`, `npm run seed` y `npm run dev` desde la raíz. Abrí <http://localhost:5173>. Para verificar tipos y compilar el frontend: `npm run build`.

El registro público está deshabilitado. Las categorías eliminadas se desactivan para preservar el historial; los gastos eliminados por sus dueños se borran definitivamente. La vista familiar muestra exclusivamente el mes actual, sin borrar meses anteriores. El importe máximo por gasto es $21.474.836,47.

## Despliegue en EasyPanel

El repositorio es un monorepo: los servicios de frontend y backend se construyen por separado desde el mismo repositorio de GitHub. El dominio público apunta únicamente al frontend, que sirve los archivos estáticos y reenvía `/api/` al backend por la red interna. EasyPanel termina HTTPS.

1. Creá un servicio PostgreSQL con almacenamiento persistente, contraseña segura y acceso solo desde la red interna. Configurá copias de seguridad periódicas fuera del servidor y comprobá que se puedan restaurar. No borres el volumen al actualizar los servicios.
2. Creá el servicio de backend desde GitHub. Usá la raíz del repositorio como contexto de construcción y `backend/Dockerfile` como ruta del Dockerfile. El puerto interno es `3000`; no necesita dominio público. Configurá estas variables en EasyPanel:
   - `DATABASE_URL`: URL de conexión interna de PostgreSQL, por ejemplo `postgresql://usuario:contraseña@host-interno:5432/gastando` (codificá los caracteres especiales de usuario y contraseña como componentes de URL).
   - `FRONTEND_URL` y `BETTER_AUTH_URL`: la misma URL pública con HTTPS, por ejemplo `https://gastando.ejemplo.com`, sin barra final ni `/api`.
   - `BETTER_AUTH_SECRET`: secreto aleatorio único de al menos 32 caracteres; conservá el mismo entre despliegues.
   - Para la creación inicial, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 8 caracteres) y `ADMIN_NAME`.
3. Desplegá el backend. En cada arranque aplica las migraciones pendientes antes de iniciar; si fallan, no inicia. Usá una sola instancia durante las migraciones y hacé una copia de seguridad antes de actualizar el esquema.
4. Una vez que el backend esté funcionando, ejecutá **una sola vez** en la consola del contenedor del backend: `node dist/seed.js`. Esto crea las categorías si la tabla está vacía y el administrador si ese correo aún no existe. Verificá el resultado; si faltan `ADMIN_EMAIL` o `ADMIN_PASSWORD`, el administrador no se crea. Cambiar esas variables después no modifica una cuenta existente. Para evitar crear otra cuenta accidentalmente, quitá las variables `ADMIN_*` tras la inicialización y no ejecutes el seed automáticamente.
5. Creá el servicio de frontend desde el mismo repositorio, con la raíz como contexto y `frontend/Dockerfile` como Dockerfile. Configurá `BACKEND_UPSTREAM` con la URL interna real del backend, por ejemplo `http://nombre-interno-del-backend:3000` (sin barra final). El nombre depende del proyecto y la red de EasyPanel; ambos servicios deben poder comunicarse. El puerto interno del frontend es `80`.
6. Asociá el subdominio HTTPS existente al frontend en EasyPanel. Comprobá que el navegador pueda iniciar sesión, crear y editar un gasto y acceder a la administración. Si `/api` devuelve 502, revisá el nombre interno, el puerto y la red del backend.

No subas archivos `.env`, secretos ni credenciales a GitHub. Actualizá cada servicio por separado desde EasyPanel, cuidando la compatibilidad entre versiones del frontend, backend y base de datos. Las imágenes de producción no reemplazan `docker-compose.yml`, que sigue siendo para desarrollo local.
