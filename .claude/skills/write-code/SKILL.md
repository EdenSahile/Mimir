---
name: write-code
description: Implemente le code de production pour satisfaire les tests ecrits par write-tests. Utiliser quand l'utilisateur dit "write-code", "ecris le code", "implemente", "fais passer les tests".
---

## Entree

- Les **tests ecrits par `write-tests`**, deja commites et en echec (red).
- Les **criteres d'acceptation** du ticket pour le contexte.

## Sortie

- Le **code de production** implemente.
- Les **tests verts** (green).

---

## Pre-vol

Verifier que des tests existent pour le ticket courant :

- Lire les fichiers `.test.ts` / `.test.tsx` lies au ticket.
- S'il n'y a aucun test, **stop** : le dire et renvoyer vers `write-tests`.

## Etapes

### 1. Lire les tests

Lire les fichiers de test pour comprendre les comportements attendus. Les tests sont la specification : chaque `it(...)` decrit un comportement que le code doit satisfaire.

### 2. Lire les criteres d'acceptation

Completer la comprehension avec les criteres d'acceptation du ticket et les notes techniques.

### 3. Implementer

Ecrire le code de production en respectant :

- L'architecture du projet (rules `architecture-frontend.md` / `architecture-backend.md`).
- Les conventions de fichiers (rules `files-frontend.md` / `files-backend.md`).
- Les conventions d'imports (rules `imports-frontend.md` / `imports-backend.md`).
- Les conventions UI (rules `ui.md`, `icones.md`, `button.md`).
- Les tokens et maquettes du design handoff quand le ticket est UI.

### 4. Faire passer les tests

Executer `pnpm test` apres l'implementation.

- Si tous les tests passent : green confirme. Commiter.
- Si des tests echouent : lire les erreurs, corriger l'implementation, relancer. Ne jamais modifier un test pour le faire passer (sauf si le test a un vrai bug).

### 5. Commiter

Commiter le code de production avec un message Conventional Commit :

```
feat(MIM-X): implement <feature>
```

Ou `fix`, `refactor`, etc. selon la nature du changement.

## Regles

- **Ne jamais modifier un test pour le faire passer**, sauf bug avere dans le test (assertion incorrecte, mauvaise comprehension du critere). Dans ce cas, expliquer pourquoi et demander validation a l'utilisateur.
- **Ne pas ajouter de fonctionnalites au-dela des criteres d'acceptation.** Le code satisfait les tests et les criteres, rien de plus.
- **Respecter l'architecture existante.** Ne pas creer de nouveaux dossiers de premier niveau sans accord explicite.

## Anti-patterns

- Implementer sans avoir lu les tests d'abord.
- Modifier les tests pour les faire passer au lieu de corriger l'implementation.
- Ajouter des features non demandees dans les criteres.
- Ignorer les conventions d'architecture ou de nommage du projet.
