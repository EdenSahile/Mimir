# Mímir - Registre des décisions

## Décisions prises

### DEC-001 : Stack technique

**Date :** 2026-09-22
**Statut :** Validée

Frontend React + Vite + TypeScript, backend Node.js + Express + TypeScript, PostgreSQL sur Neon, Prisma, Better Auth, pgvector, Claude API.

### DEC-002 : Structure monorepo

**Date :** 2026-09-22
**Statut :** Validée

Monorepo avec pnpm workspaces. Deux apps (web, api), deux packages (db, shared).

### DEC-006 : Séparation des couches de données

**Date :** 2026-09-22
**Statut :** Validée

Cinq couches distinctes : données structurées (PostgreSQL), fichiers originaux (stockage objet), contenu indexé (pgvector), repositories externes (intégrations), environnement de dev (Claude Code). pgvector ne remplace pas le stockage du fichier original.

### DEC-007 : Projets comme entités structurées

**Date :** 2026-09-22
**Statut :** Validée

Un projet contient ses informations, ses documents liés, ses intégrations (GitHub, etc.). Un document personnel a project_id null. Ne pas confondre repository local de développement et repository externe accessible par Mímir.

### DEC-005 : Hébergement sur Vercel

**Date :** 2026-09-29
**Statut :** Validée

Frontend et backend hébergés sur Vercel. Le frontend (`apps/web`) est un build statique Vite. Le backend (`apps/api`) tournera en fonctions serverless.

Vercel convient parce que tout l'état de Mímir est externe (données sur Neon, fichiers sur stockage objet, auth et pgvector côté services), ce qui correspond au modèle serverless. Les blocages qui avaient forcé un autre projet (maison-buna) sur Render n'existent pas ici : pas de génération PDF via Chrome headless, pas de stockage sur disque local, pas de processus toujours allumé avec tâche planifiée en `setInterval`.

Deux contraintes de conception attachées à ce choix :

1. L'indexation et les embeddings (voir DEC-003) ne se font jamais en synchrone dans une requête HTTP, sous peine de dépasser la durée max d'une fonction. Ce travail passe par une tâche asynchrone (queue ou worker séparé).
2. Le streaming SSE des réponses Claude (voir DEC-009) reste borné par la durée max d'une fonction Vercel (jusqu'à 300s en Pro, 800s en Fluid Compute), largement suffisant pour une réponse IA.

Toute tâche planifiée (purge, rappel) se fait via Vercel Cron, jamais via un `setInterval` dans le serveur.

### DEC-011 : Authentification via Better Auth

**Date :** 2026-10-08
**Statut :** Validée

L'authentification (inscription, connexion, sessions) passe par Better Auth, avec l'adaptateur Prisma sur la base Neon. Les tables `Session`, `Account` et `Verification` vivent dans le schéma Prisma aux côtés de `User`.

Deux points de câblage non évidents :

1. Le handler Better Auth est monté sur `/api/auth/*`, **avant** `express.json()`. Better Auth lit le corps brut des requêtes : un `express.json()` placé avant le viderait et casserait l'authentification.
2. En développement, le frontend (port 5173) et l'API (port 3001) sont sur des origines différentes, donc le cookie de session est cross-origin. L'API active CORS avec `credentials`, et le client Better Auth renvoie le cookie sur chaque requête.

`GET /api/me` expose l'utilisateur de la session courante (réponse à plat, l'objet utilisateur directement), protégé par `requireAuth`. Côté frontend, `AuthGuard` garde les routes internes et redirige vers `/login` sans session.

---

## Décisions ouvertes

### DEC-003 : Fournisseur et dimension des embeddings

**Statut :** En attente

Le fournisseur d'embeddings n'est pas choisi. Options envisagées : OpenAI text-embedding-3-small (1536 dimensions), Voyage AI, modèle open source. La dimension des vecteurs n'est pas figée. Le schéma Prisma ne contient pas encore de colonne vector sur DocumentChunk et Memory. Elle sera ajoutée par une migration SQL brute quand la décision sera prise. Les interfaces `EmbeddingService` et `EmbeddingConfig` dans `packages/shared` permettent de changer de fournisseur sans modifier le reste du code.

### DEC-004 : Fournisseur de stockage objet

**Statut :** En attente

Le fournisseur de stockage des fichiers utilisateurs n'est pas choisi. Options envisagées : Cloudflare R2 (compatible S3, moins cher), AWS S3, Supabase Storage. L'interface `StorageService` dans `packages/shared` permet de changer de fournisseur sans modifier le reste du code. Pour le développement local, un stockage sur disque peut suffire temporairement.

### DEC-008 : Modèle économique

**Statut :** En attente

Gratuit, freemium, payant ? Impacte la gestion des quotas API Claude, le rate limiting, et l'architecture de billing.

### DEC-009 : Streaming des réponses IA

**Statut :** En attente

SSE (plus simple, suffisant pour du texte unidirectionnel) ou WebSocket (bidirectionnel, plus complexe). SSE recommandé pour le MVP.

### DEC-010 : Nom de domaine

**Statut :** En attente
