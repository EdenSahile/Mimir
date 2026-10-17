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
2. ~~En développement, le frontend (port 5173) et l'API (port 3001) sont sur des origines différentes, donc le cookie de session est cross-origin. L'API active CORS avec `credentials`, et le client Better Auth renvoie le cookie sur chaque requête.~~

   **Amendé le 2026-10-17 par DEC-012.** Le développement n'est plus cross-origin. Le client Better Auth n'a plus de `baseURL` : il tape la même origine, et le proxy de `vite.config.ts` renvoie `/api` vers le port 3001. Le navigateur ne parle donc qu'au port 5173. CORS reste en place pour l'instant, mais devient inutile dans les 3 environnements et sera retiré dans un second temps.

`GET /api/me` expose l'utilisateur de la session courante (réponse à plat, l'objet utilisateur directement), protégé par `requireAuth`. Côté frontend, `AuthGuard` garde les routes internes et redirige vers `/login` sans session.

### DEC-012 : 1 projet Vercel, 2 services, authentification same-origin

**Date :** 2026-10-17
**Statut :** Validée
**Amende :** DEC-011 point 2

DEC-005 tranchait l'hébergement sur Vercel sans trancher la topologie. Elle est fixée ici : **1 seul projet Vercel contenant 2 services** au sens de Vercel Services, `web` avec pour racine `apps/web` et `api` avec pour racine `apps/api`. Les 2 sont construits séparément mais déployés ensemble, derrière un domaine unique et une URL de preview unique.

Les backends d'un projet Services tournent comme des Vercel Functions sur Fluid Compute, ce qui reste conforme à DEC-005 : le modèle d'exécution serverless ne change pas, seule la déclaration change.

L'alternative écartée était 2 projets Vercel séparés, avec un domaine par projet et `VITE_API_URL` côté frontend. Motif du rejet : elle impose CORS et des cookies cross-site en production, soit précisément la complexité que le domaine unique supprime.

**Conséquence sur l'authentification.** Le frontend et l'API partagent la même origine. `baseURL` disparaît du client Better Auth, qui tape alors son chemin par défaut `/api/auth` sur la même origine, là où le serveur monte déjà le handler. Le développement devient same-origin lui aussi via le proxy Vite, d'où l'amendement de DEC-011 point 2.

**Conséquence sur les URLs de preview.** Les URLs de preview sont générées par déploiement, donc des variables fixes ne peuvent pas les couvrir. `FRONTEND_URL` et `BETTER_AUTH_URL` restent des variables fixes en production, et ne sont dérivées de `VERCEL_URL` (avec `https://` ajouté à la main, cette variable ne portant pas le protocole) que lorsque `VERCEL_ENV` vaut `preview`. Ne pas dériver la production de `VERCEL_URL` : elle porte l'URL `*.vercel.app` propre au déploiement et non le domaine personnalisé, ce qui enverrait cookies et origines de confiance sur le mauvais hôte. `trustedOrigins` suit cette même valeur.

#### Deployment Protection sur les previews : désactivation temporaire et conditionnée

La protection standard est **désactivée sur les previews**, parce que `VERCEL_URL` est documentée comme inutilisable avec elle, et parce qu'un second cookie d'authentification sur le même hôte rendrait indéchiffrable le test du cookie de session same-origin.

Cette désactivation est **temporaire et conditionnée** :

- Elle vaut **uniquement pour valider MIM-37**, et **tant qu'aucune donnée réelle n'existe sur la branche Neon de développement**. Mímir stocke des documents personnels (`Document`, `Memory`, `Message`) : un preview public n'est donc pas anodin, et la condition expire d'elle-même dès que du réel entre en base.
- **Échéance de réactivation : le jour même, dès que la séquence de validation de MIM-37 est verte.** Pas « avant la première fonctionnalité qui touche des documents » : une fenêtre ouverte de plusieurs semaines est une fenêtre qu'on oublie de refermer. La protection se rallume dans la même session que la validation.
- Le rappel posé sur la ligne « Upload de fichiers vers le stockage objet » de la phase 3 de la roadmap reste comme filet, au cas où la réactivation du jour même serait manquée. Ce n'est pas l'échéance, c'est le dernier rattrapage possible.
- À la réactivation, bascule sur l'option conservatrice : valider `VERCEL_BRANCH_URL` comme source d'URL de preview à la place de `VERCEL_URL`, et câbler `VERCEL_AUTOMATION_BYPASS_SECRET` dans `playwright.config.ts` pour que les tests scriptés traversent la protection.

**Condition bloquante avant la désactivation :** la **valeur** de `BETTER_AUTH_SECRET` en Preview doit être vérifiée différente de celle de Production, pas seulement présente. Ce secret signe les cookies de session : partagé entre les 2 environnements, il rend un cookie forgé sur un preview public valable en production. Tant que la différence n'est pas vérifiée, la protection reste active.

**Règle permanente, indépendante de l'échéance ci-dessus :** `DATABASE_URL`, `BETTER_AUTH_SECRET` et le futur bucket de stockage objet sont **distincts entre Production et Preview**. Un preview ne touche jamais les données de production.

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
