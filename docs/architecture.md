# Mímir - Architecture technique

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Base de données | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentification | Better Auth |
| Recherche vectorielle | pgvector |
| IA | Claude API (Anthropic) |

## Structure du monorepo

```
mimir/
├── apps/
│   ├── web/         # Frontend React
│   └── api/         # Backend Express
├── packages/
│   ├── db/          # Prisma schema et client
│   └── shared/      # Types et interfaces partagés
└── docs/            # Documentation produit et technique
```

Gestionnaire de packages : pnpm avec workspaces.

## Couches de données

Mímir distingue 5 couches de données distinctes :

| Couche | Contenu | Technologie |
|--------|---------|-------------|
| Données structurées | Profils, objectifs, projets, tâches, préférences, conversations | PostgreSQL / Prisma |
| Fichiers originaux | CV, certifications, documents projet | Stockage objet (fournisseur non choisi) |
| Contenu indexé | Texte extrait et vectorisé pour la recherche sémantique | pgvector |
| Repositories externes | Code source, issues, PRs | Intégrations (GitHub API, etc.) |
| Environnement de développement | Code de Mímir sur la machine du développeur | Claude Code (dev uniquement) |

## Architecture IA

L'architecture IA de Mímir distingue :

- **Orchestrateur** : reçoit les messages utilisateur, assemble le contexte (profil + mémoire + documents pertinents), détermine quel agent appeler, gère le flux de la conversation
- **Agents** : spécialisés par domaine (conversation générale, veille, tâches, etc.), chacun avec son propre prompt et ses outils
- **Mémoire** : faits et observations retenus par Mímir, recherchables par similarité sémantique
- **Modules** : fonctionnalités activables qui fournissent des agents et des outils spécifiques

## Pipeline documents

1. Upload du fichier vers le stockage objet
2. Extraction du texte (parsing PDF, DOCX, etc.)
3. Découpage en chunks
4. Génération des embeddings
5. Stockage des chunks et vecteurs dans PostgreSQL (pgvector)
6. Recherche sémantique lors des conversations

## Communication frontend/backend

- API REST pour les opérations CRUD (profil, projets, documents, etc.)
- SSE (Server-Sent Events) pour le streaming des réponses IA
- Proxy Vite en développement (`/api` redirigé vers le backend)
