# Mímir - Roadmap

## Phase 1 : Socle technique (en cours)

- [x] Structure monorepo (apps/web, apps/api, packages/db, packages/shared)
- [x] Schéma Prisma complet
- [x] Interfaces abstraites (stockage, embeddings)
- [x] Documentation (product, architecture, data model, decisions)
- [ ] Initialisation git et premier commit
- [ ] Installation des dépendances (pnpm install)
- [ ] Connexion à Neon et première migration

## Phase 2 : MVP fonctionnel

- [ ] Authentification (Better Auth)
- [ ] Onboarding utilisateur (formulaire multi-étapes)
- [ ] CRUD profil, objectifs, projets
- [ ] Interface de chat avec streaming
- [ ] Orchestrateur IA (assemblage de contexte + appel Claude)
- [ ] Mémoire basique (stockage et rappel dans les conversations)

## Phase 3 : Documents

- [ ] Upload de fichiers vers le stockage objet
- [ ] Parsing de documents (PDF, DOCX)
- [ ] Indexation vectorielle (pgvector)
- [ ] Recherche sémantique dans les conversations
- [ ] Gestion des documents dans l'UI (liste, preview, suppression)

## Phase 4 : Modules

- [ ] Système de modules (activation, configuration par utilisateur)
- [ ] Module My Day (briefing quotidien)
- [ ] Module AI News (veille contextuelle)
- [ ] Module Job Watch (suivi offres d'emploi)

## Phase 5 : Intégrations

- [ ] Framework d'intégrations OAuth
- [ ] Google Calendar
- [ ] Gmail
- [ ] GitHub (liaison projet/repo)
- [ ] Notion

## Phase 6 : Production

- [ ] Déploiement (frontend + backend + base)
- [ ] Chiffrement des tokens OAuth
- [ ] Rate limiting et quotas API
- [ ] Monitoring et logs
- [ ] Nom de domaine
