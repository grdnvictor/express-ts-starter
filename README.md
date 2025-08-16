# Express Service

Service Express.js avec TypeScript, Prisma et Docker pour le développement et la production.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 23.8.0+
- Docker & Docker Compose
- Git

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd express-service

# Copier le fichier d'environnement
cp .env.example .env

# Compléter les variables d'environnement
# Notamment JWT_SECRET qui est obligatoire
```

## 🛠️ Développement

### Démarrage en mode développement

```bash
# Démarrer tous les services de développement
npm run dev:docker

# Ou démarrer seulement la base de données
npm run dev:docker:db

# Développement local (nécessite une DB externe)
npm run dev
```

### Gestion de la base de données

```bash
# Créer et appliquer une migration
npm run dev:prisma:migrate

# Générer le client Prisma
npm run dev:prisma:generate

# Ouvrir Prisma Studio
npm run dev:prisma:studio

# Seeder la base de données
npm run dev:prisma:seed

# Reset complet de la DB
npm run dev:prisma:reset
```

### Utilitaires de développement

```bash
# Voir les logs du serveur
npm run dev:docker:logs

# Arrêter les services
npm run dev:docker:down

# Nettoyer complètement (supprime les volumes)
npm run dev:docker:clean
```

## 🏗️ Production

### Construction et déploiement

```bash
# Construire le projet
npm run build

# Démarrer en production
npm run prod

# Ou démarrer directement l'application compilée
npm start
```

### Gestion en production

```bash
# Voir les logs
npm run prod:logs

# Redémarrer le serveur
npm run prod:restart

# Arrêter les services
npm run prod:down

# Nettoyer complètement
npm run prod:clean
```

### Migrations en production

```bash
# Appliquer les migrations
npm run prisma:migrate

# Générer le client Prisma
npm run prisma:generate

# Seeder la base de données
npm run prisma:seed

# Ouvrir Prisma Studio (optionnel)
npm run prisma:studio
```

## 📁 Structure du projet

```
express-service/
├── src/
│   ├── contracts/          # Contrats Zod pour validation
│   ├── controllers/        # Contrôleurs métier
│   ├── middlewares/        # Middlewares Express
│   ├── routes/            # Définition des routes
│   ├── services/          # Services (Prisma, etc.)
│   ├── RouteLoader.ts     # Chargeur automatique de routes
│   └── index.ts           # Point d'entrée
├── prisma/
│   ├── schema/            # Schémas Prisma
│   └── seed.ts           # Script de seeding
├── api-playground/        # Tests API avec HTTP files
├── .env.example          # Template variables d'environnement
├── compose.dev.yaml      # Configuration Docker dev
├── compose.yaml          # Configuration Docker prod
├── Dockerfile.dev        # Image Docker développement
└── Dockerfile           # Image Docker production
```

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```bash
# Ports
SERVICE_PORT=3333                    # Port exposé
INTERNAL_SERVICE_PORT=3000          # Port interne du conteneur

# Base de données
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=myapp

# Sécurité
JWT_SECRET=your-super-secret-key    # ⚠️ OBLIGATOIRE

# Docker
COMPOSE_PROJECT_NAME=myapp          # Nom du projet Docker
```

### Différences dev/prod

**Développement :**
- Hot reload avec `tsx watch`
- Volumes montés pour le code source
- Base de données exposée sur port 5432
- Prisma Studio disponible sur port 5555

**Production :**
- Image optimisée multi-stage
- Utilisateur non-root
- Healthchecks configurés
- Prisma Studio en mode `--profile tools`

## 🗄️ Base de données

### Prisma

Le projet utilise Prisma avec PostgreSQL. Les schémas sont organisés dans `prisma/schema/`.

```bash
# Commandes Prisma essentielles
npx prisma generate              # Générer le client
npx prisma migrate dev          # Créer et appliquer migration (dev)
npx prisma migrate deploy       # Appliquer migrations (prod)
npx prisma studio              # Interface graphique
npx prisma db seed             # Seeder les données
```

⚠️ **Important** : Exécutez les commandes Prisma via Docker pour que la résolution DNS fonctionne :

```bash
docker compose -f compose.dev.yaml exec server npx prisma migrate dev --name ma_migration
```

## 🛣️ Routes

Les routes sont chargées automatiquement depuis `src/routes/` grâce au `RouteLoader`.

### Exemple de route

```typescript
import { Router } from "express";
import { validateContract, checkAuthentication } from "@/middlewares";
import { MonContract } from "@/contracts";
import { MonController } from "@/controllers";

export default function (router: Router) {
  router.post(
    "/mon-endpoint",
    checkAuthentication,
    validateContract(MonContract),
    MonController.action
  );
  
  return router;
}
```

## 🔒 Sécurité

- JWT pour l'authentification (middleware à implémenter)
- Validation des données avec Zod
- Images Docker avec utilisateur non-root
- Variables d'environnement pour les secrets

## 📊 Monitoring

### Healthchecks

- **Dev** : `wget http://localhost:3000/test`
- **Prod** : `curl http://localhost:3000/health`

### Logs

```bash
# Développement
npm run dev:docker:logs

# Production
npm run prod:logs
```

## 🧪 Tests API

Utilisez les fichiers HTTP dans `api-playground/` avec votre IDE (VS Code REST Client, IntelliJ HTTP Client).

Configuration dans `api-playground/config/http-client.env.json`.

## 📝 Développement

### Ajout d'une nouvelle route

1. Créer le contrat Zod dans `src/contracts/`
   - :warning: Pour vous simplifier la création, utiliser le contract builder fournit dans `src/contracts/ContractBuilder.ts`.
2. Créer le contrôleur dans `src/controllers/`
3. Créer le fichier de route dans `src/routes/`
4. Tester avec les fichiers HTTP

### Ajout d'un modèle Prisma

1. Modifier `prisma/schema/example.prisma`
2. Créer la migration : `npm run dev:prisma:migrate`
3. Générer le client : `npm run dev:prisma:generate`