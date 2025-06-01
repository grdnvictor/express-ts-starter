# Express service

## Prisma

### Utilisation

Il est nécessaire de passer par le conteneur Docker du serveur d'auth pour exécuter les commandes Prisma.

_Exemple de commande pour générer le client Prisma :_

```bash
docker compose exec server npx prisma generate
```

_Étant donné que le `.env`utilise le nom
du conteneur docker de base de données, il est nécessaire de passer par
le conteneur pour que la résolution de nom de service se fasse._

###

### Migration

### Créer une migration

_Le `migrate dev` créer une migration et l'applique à la base de données directement._

```bash
docker compose exec server npx prisma migrate dev --name <migration_name>
```

> :warning: Penser à executer la commande `prisma generate` après chaque migration pour générer le client Prisma.
