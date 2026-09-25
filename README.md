# Mímir

> Une intelligence qui connaît votre contexte.

![Landing page de Mímir](design_handoff_mimir/screenshots/desktop/01-landing.jpg)

Mímir est un assistant personnel IA qui rassemble votre journée, vos projets, vos documents et votre mémoire dans un seul espace. Vous lui parlez, il agit avec ce qu'il sait de vous.

Dans la mythologie nordique, Mímir est le gardien d'une source de sagesse et de connaissance. Odin lui-même vient y chercher ce qu'il ne sait pas encore. Même après sa mort, sa tête continue de conseiller ceux qui la consultent.

## A quoi ça sert

Mímir est générique : le moteur fonctionne pour n'importe quel profil.

- **Commercial** : brief client prêt avant chaque rendez-vous, sans l'avoir préparé.
- **Comptable** : courriers de relance rédigés à partir du fichier des échéances, prêts à être relus en brouillon.
- **Manager** : résumé des décisions en attente en début de semaine, sans relire 30 comptes-rendus.
- **Étudiant** : fiches de révision adaptées à chaque examen, à partir des cours déposés.
- **PO** : backlog trié par priorité avec les tickets bloqués signalés.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Base de données | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Better Auth |
| Recherche vectorielle | pgvector |
| IA | Claude API (Anthropic) |
| Design | Claude Design (Anthropic) |

## Méthodologie de développement

Ce projet est construit avec Claude Code, dans un cadre structuré et contrôlé.

### Rules, skills et agents

| Type | Nombre | Exemples |
|------|--------|----------|
| Rules | 15 | Architecture frontend/backend, conventions de fichiers, imports, TDD, UI, icônes |
| Skills | 5 | `start-ticket`, `write-tests`, `write-code`, `open-pr`, `merge-pr` |
| Agents | 2 | `test-planner` (stratégie de test), `unit-test-writer` (écriture des tests) |

### Workflow TDD

```
start-ticket → DOING
  ↓
test-planner → stratégie de test
  ↓
write-tests → tests écrits, RED confirmé
  ↓
write-code → implémentation, GREEN confirmé
  ↓
open-pr → lint + typecheck + tests + code review → PR
  ↓
merge-pr → merge → ticket en TO TEST
  ↓
TO TEST → validation fonctionnelle finale
```

### Quality gates

Avant chaque PR, 3 vérifications bloquantes s'exécutent dans l'ordre : lint, typecheck, tests. Si un seul est rouge, rien ne part.

### Séparation humain / IA

L'IA propose, l'humain valide. L'IA ne merge pas, ne contourne pas un test qui échoue, ne change pas un statut de ticket sans accord explicite.

## Structure du monorepo

```
apps/web/          Frontend React
apps/api/          Backend Express
packages/db/       Prisma schema et client
packages/shared/   Types et interfaces partagés
docs/              Documentation produit et technique
.claude/rules/     15 règles de développement
.claude/skills/    5 skills (procédures reproductibles)
.claude/agents/    2 agents spécialisés
```

## Démarrage rapide

```bash
pnpm install
cp .env.example .env    # Configurer les variables d'environnement
pnpm db:generate        # Générer le client Prisma
pnpm dev                # Lancer le projet
```

## Roadmap

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1 | Socle technique (monorepo, Prisma, docs, design) | En cours |
| 2 | MVP fonctionnel (auth, onboarding, chat, mémoire) | A venir |
| 3 | Documents (upload, parsing, recherche sémantique) | A venir |
| 4 | Modules (My Day, AI News, Job Watch) | A venir |
| 5 | Intégrations (Google Calendar, Gmail, GitHub, Notion) | A venir |
| 6 | Production (déploiement, monitoring, domaine) | A venir |

## Documentation

- [`docs/product.md`](docs/product.md) : vision produit
- [`docs/architecture.md`](docs/architecture.md) : architecture technique
- [`docs/data-model.md`](docs/data-model.md) : schéma de données
- [`docs/roadmap.md`](docs/roadmap.md) : phases de développement
- [`docs/decisions.md`](docs/decisions.md) : registre des décisions
