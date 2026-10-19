# CLAUDE.md

## Ce projet

Mímir est une application web d'assistant personnel IA. Chaque utilisateur possède son propre Mímir, personnalisé selon son profil, ses objectifs, ses projets et ses documents.

Ce fichier guide Claude Code pendant le développement de Mímir. Il ne fait pas partie du runtime de Mímir en production.

## Stack

- Frontend : React + Vite + TypeScript (`apps/web/`)
- Backend : Node.js + Express + TypeScript (`apps/api/`)
- Base de données : PostgreSQL sur Neon, Prisma ORM (`packages/db/`)
- Auth : Better Auth
- Recherche vectorielle : pgvector
- IA : Claude API

## Structure

```
apps/web/          Frontend React
apps/api/          Backend Express
packages/db/       Prisma schema et client
packages/shared/   Types et interfaces partagés
docs/              Documentation produit et technique
_archive/          Anciens fichiers du Starter Kit (référence)
```

## Commandes

```bash
pnpm install           # Installer les dépendances
pnpm dev               # Lancer frontend + backend en parallèle
pnpm dev:api           # Lancer uniquement le backend
pnpm dev:web           # Lancer uniquement le frontend
pnpm db:generate       # Générer le client Prisma
pnpm db:push           # Pousser le schéma vers la base (local et test UNIQUEMENT)
pnpm db:migrate        # Créer une migration
pnpm db:deploy <.env>  # Appliquer les migrations en attente sur la base du fichier
                       # ou DIRECT_URL="..." pnpm db:deploy, sans fichier
pnpm db:audit <.env>   # Mesurer en lecture seule l'etat d'une base (meme 2 formes)
```

Pour exécuter du SQL ponctuel, depuis `packages/db` et **sans `--schema`** :

```bash
echo "SELECT 1;" | DIRECT_URL="..." pnpm exec prisma db execute --stdin
```

Depuis Prisma 7, `schema` vit dans `prisma.config.ts`, et passer `--schema` fait échouer la commande en réaffichant son aide, « Script input, only 1 must be provided », qui désigne l'entrée du script alors que le fautif est le drapeau. Les variables se passent devant la commande, pour la durée de cette seule commande, jamais par `export`.

`db:push` applique le schéma sans rien inscrire dans l'historique des migrations : la base se retrouve désalignée, et le `db:deploy` suivant échoue sur un objet déjà existant. Il ne s'utilise donc que sur la base de développement local et sur celle de test, jamais sur preview ni sur production, où le schéma ne change que par une migration. Le contrôle est automatique : `packages/db/cliDatasource` refuse un `db push` dont la cible n'est pas l'une de ces 2 bases.

## Principes

- Mímir est générique. Aucune donnée spécifique à un utilisateur n'est codée en dur.
- Cinq couches de données distinctes : données structurées (PostgreSQL), fichiers originaux (stockage objet), contenu indexé (pgvector), repositories externes (intégrations), environnement de dev (Claude Code).
- Les interfaces `StorageService` et `EmbeddingService` dans `packages/shared/` sont des abstractions. Le fournisseur concret n'est pas encore choisi.
- Les décisions encore ouvertes sont documentées dans `docs/decisions.md`.

## Documentation

- `docs/product.md` : vision produit
- `docs/architecture.md` : architecture technique
- `docs/data-model.md` : schéma de données
- `docs/roadmap.md` : phases de développement
- `docs/decisions.md` : registre des décisions (prises et ouvertes)
- `docs/specs/` : specs de conception, 1 fichier par chantier (`AAAA-MM-JJ-<sujet>-design.md`)
