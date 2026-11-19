FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci
COPY backend ./backend
RUN npm run build -w backend && npx tsc -p backend/tsconfig.build.json

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/drizzle ./backend/drizzle
WORKDIR /app/backend
USER node
EXPOSE 3000
CMD ["sh", "-c", "node dist/migrate.js && exec node dist/index.js"]
