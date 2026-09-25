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

### 5. Refactoriser

Les tests sont verts. Analyser les fichiers de production modifies et determiner si un refactoring est reellement justifie.

**Ne pas refactoriser pour refactoriser.** Le refactoring doit ameliorer la lisibilite, la maintenabilite ou la coherence avec l'architecture du projet, sans modifier le comportement attendu.

Verifier notamment :

- **Styles inline → CSS** : si un style inline est identique pour tous les elements d'une boucle, le sortir dans une classe CSS. Ne garder en inline que les valeurs dynamiques par instance (position, duree). Preferer les custom properties CSS (`--var`) pour transmettre des valeurs dynamiques a une classe.
- **Composants** : un composant ne doit contenir que la logique qui lui est propre. Si une fonction utilitaire ne depend pas de React, elle vit hors du composant.
- **Imports** : verifier que tous les imports internes utilisent `@/`, jamais `./` ni `../`.
- **Duplication** : identifier les duplications significatives et extraire uniquement lorsque l'abstraction ameliore reellement la lisibilite ou la maintenabilite. Ne pas creer d'abstraction prematuree.
- **Poids** : supprimer les variables, imports et props inutilises.
- **Complexite** : simplifier une logique inutilement complexe lorsque cela ameliore la lisibilite sans modifier le comportement.

Si aucun refactoring pertinent n'est identifie, ne modifier aucun code et poursuivre.

Apres chaque modification de refactoring, relancer `pnpm test` pour confirmer que les tests restent verts.

**Ne pas modifier les criteres verifies par les tests et ne pas modifier les tests simplement pour accompagner le refactoring.** Si le refactoring necessite reellement de changer la maniere dont un comportement est verifie, arreter et demander validation avant de modifier les tests.

### 6. Validation finale

Lancer la suite complete avant de commiter :

```bash
pnpm test && pnpm typecheck && pnpm lint
```

Les 3 doivent passer. Si l'un echoue, corriger et relancer.

### 7. Commiter

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
