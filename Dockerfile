# Stage 1: Dependencies
FROM node:23.8.0-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:23.8.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:23.8.0-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expressuser -u 1001

# Copier uniquement les fichiers nécessaires
COPY --from=deps --chown=expressuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressuser:nodejs /app/dist ./dist
COPY --from=builder --chown=expressuser:nodejs /app/prisma ./prisma
COPY --chown=expressuser:nodejs package*.json ./
COPY --chown=expressuser:nodejs .env ./

# Générer Prisma pour le runtime
RUN npx prisma generate

USER expressuser

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["exec", "node", "--no-experimental-strip-types", "dist/index.js"]