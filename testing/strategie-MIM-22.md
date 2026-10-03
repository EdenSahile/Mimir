## Strategie de test -- MIM-22 (Connecter Neon et premiere migration)

Ticket d'infra : les 6 criteres sont **operationnels** (une commande tourne, une
extension est activee, la connexion repond). Rien n'est testable en unitaire :
chaque verification depend de la vraie base Neon et des secrets du `.env`, hors
du perimetre d'un test auto. Tous les criteres sont donc 🔴 smoke.

| Critere | Type | Fait |
|---|---|---|
| `DATABASE_URL` configure dans `.env` (non committe) | 🔴 | ⬜ Smoke |
| `pnpm db:generate` genere le client Prisma sans erreur | 🔴 | ⬜ Smoke |
| `pnpm db:migrate` cree toutes les tables | 🔴 | ⬜ Smoke |
| Le backend peut se connecter et executer une requete | 🔴 | ⬜ Smoke |
| Extension pgvector activee sur la base | 🔴 | ⬜ Smoke |
| `.env.example` avec les variables necessaires | 🔴 | ⬜ Smoke |

### Raisonnement par critere

**`DATABASE_URL` configure dans `.env` (non committe)** -- 🔴
La presence d'un secret dans un fichier gitignore ne se teste pas en auto. On
verifie a la main que `.env` contient `DATABASE_URL` et `DIRECT_URL`, et que
`git check-ignore .env` confirme qu'il n'est pas suivi.

**`pnpm db:generate` genere le client Prisma sans erreur** -- 🔴
Commande de tooling. On l'execute et on verifie la sortie "Generated Prisma
Client" sans erreur. Pas de connexion a la base requise.

**`pnpm db:migrate` cree toutes les tables** -- 🔴
Commande qui agit sur la vraie base. On l'execute et on verifie que la migration
s'applique et cree les 15 tables du schema. Depend de Neon et des secrets.

**Le backend peut se connecter et executer une requete** -- 🔴
`pnpm db:check` ouvre une connexion via le client Prisma (le meme que le backend
consomme) et execute `SELECT 1`. Verification de bout en bout contre la base
reelle, pas un test unitaire.

**Extension pgvector activee sur la base** -- 🔴
L'extension est declaree dans le datasource Prisma ; la migration emet
`CREATE EXTENSION IF NOT EXISTS "vector"`. On verifie sa presence dans le SQL de
migration et son activation sur la base (dashboard Neon ou `pnpm db:studio`).

**`.env.example` avec les variables necessaires** -- 🔴
Documentation. On verifie a l'oeil que `.env.example` liste `DATABASE_URL`
(poolee) et `DIRECT_URL` (directe) avec la note Neon.

## A verifier manuellement

6 scenarios dans [`testing/smokes-MIM-22.md`](smokes-MIM-22.md). Tous joues en
vert pendant le dev (local). La validation de la connexion depuis le deploiement
Vercel (env de prod) relevera du ticket de deploiement.
