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
pnpm db:push           # Pousser le schéma vers la base
pnpm db:migrate        # Créer une migration
```

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
