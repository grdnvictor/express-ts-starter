FROM node:23.8.0-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer toutes les dépendances (y compris dev pour le build)
RUN npm ci

# Copier tout le code
COPY . .

# Générer Prisma
RUN npx prisma generate

# Build avec debug
RUN echo "=== BUILDING ===" && npm run build && echo "=== BUILD DONE ===" && ls -la dist/

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Commande
CMD ["node", "dist/index.js"]