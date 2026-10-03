# Smoke tests -- MIM-22 (Connecter Neon et premiere migration)

> Criteres d'infra, verifies en local pendant le dev contre la vraie base Neon.
> Prerequis : un projet Neon cree, et `.env` a la racine contenant `DATABASE_URL`
> (connexion poolee) et `DIRECT_URL` (connexion directe).

## Preconditions generales

- Depuis la racine du repo.
- `.env` rempli avec les 2 URLs Neon du meme projet.

---

### 1. `DATABASE_URL` / `DIRECT_URL` presents et `.env` non suivi

**Etapes**
1. `grep -c '^DATABASE_URL=' .env` et `grep -c '^DIRECT_URL=' .env`.
2. `git check-ignore .env`.

**Resultat attendu**
- Les deux `grep` renvoient `1`.
- `git check-ignore .env` affiche `.env` (donc ignore, jamais committe).

- [x] Passe

---

### 2. `pnpm db:generate` genere le client sans erreur

**Etapes**
1. `pnpm db:generate`.

**Resultat attendu**
- Sortie "Generated Prisma Client", aucune erreur.

- [x] Passe

---

### 3. `pnpm db:migrate` cree toutes les tables

**Etapes**
1. `pnpm db:migrate` (premiere fois : migration `init`).

**Resultat attendu**
- La migration s'applique sans erreur ("Your database is now in sync").
- Un dossier `packages/db/prisma/migrations/<timestamp>_init/` est cree.
- Le SQL cree les 15 tables du schema.

- [x] Passe

---

### 4. Le backend se connecte et execute une requete

**Etapes**
1. `pnpm db:check`.

**Resultat attendu**
- Affiche `DB connection OK, SELECT 1 returned 1`.

- [x] Passe

---

### 5. Extension pgvector activee

**Etapes**
1. `grep -i 'create extension' packages/db/prisma/migrations/*_init/migration.sql`.
2. (Optionnel) dans le dashboard Neon ou `pnpm db:studio`, verifier l'extension `vector`.

**Resultat attendu**
- Le SQL de migration contient `CREATE EXTENSION IF NOT EXISTS "vector";`.
- L'extension `vector` est presente sur la base.

- [x] Passe

---

### 6. `.env.example` documente les variables

**Etapes**
1. Ouvrir `.env.example`.

**Resultat attendu**
- Presence de `DATABASE_URL` (poolee) et `DIRECT_URL` (directe), avec la note Neon.

- [x] Passe
