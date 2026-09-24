---
name: write-tests
description: Orchestre la planification et l'ecriture des tests avant le code de production. Utiliser quand l'utilisateur dit "write-tests", "ecris les tests", "on commence les tests", "TDD".
---

## Entree

- Un **ticket en DOING** avec ses criteres d'acceptation (deja affiches par `start-ticket` ou lisibles dans Notion).

## Sortie

- La **strategie de test** validee par l'utilisateur.
- Les **fichiers de test** ecrits et commites.
- La **confirmation que les tests detectent l'absence du comportement** (red).

---

## Etapes

### 1. Recuperer les criteres d'acceptation

Si les criteres ne sont pas deja dans le contexte de la conversation (affiches par `start-ticket`), les lire depuis la carte Notion du ticket courant.

Extraire le numero du ticket depuis le nom de branche (`MIM-\d+`).

### 2. Appeler le test-planner

Dispatcher l'agent `test-planner` avec les criteres d'acceptation.

Le test-planner produit le tableau de strategie : classification 🟢/🟠/🔴 de chaque critere, avec le niveau de test, le fichier cible, et les verifications manuelles.

### 3. Presenter la strategie a l'utilisateur

Afficher le tableau de strategie et demander validation. L'utilisateur peut :
- Valider tel quel.
- Demander de reclasser un critere (ex. passer un 🟢 en 🟠).
- Ajouter ou retirer un critere.

**Ne pas ecrire de tests avant la validation.**

### 4. Ecrire les tests

Dispatcher l'agent `unit-test-writer` avec la strategie validee (criteres 🟢 et partie auto des 🟠).

Le writer produit les fichiers `.test.ts` / `.test.tsx`.

### 5. Verifier le red

Executer `pnpm test` dans le workspace concerne.

- Si les tests ne compilent pas (import manquant), c'est attendu : le module n'existe pas encore. Le noter et continuer.
- Si les tests compilent et echouent, c'est le cas classique : red confirme.
- Si un test passe sans implementation, il y a un probleme : le test ne verifie rien d'utile. Le corriger.

### 6. Commiter

Commiter les fichiers de test avec le message :

```
test(MIM-X): add tests for <feature>

Strategie de test :
| # | Critere | Type | Fichier |
|---|---------|------|---------|
| 1 | ... | 🟢 | ... |
| 2 | ... | 🔴 | Smoke: ... |
```

Le tableau de strategie dans le commit sera repris par `open-pr` dans le corps de la PR.

## Regles

- **Les tests sont ecrits AVANT le code de production.** C'est la regle fondamentale du TDD. Jamais de code de prod avant ce skill.
- **La strategie est validee par l'utilisateur.** Ne jamais ecrire les tests sans validation prealable.
- **Les smoke tests 🔴 ne produisent pas de fichier de test.** Ils sont decrits dans le tableau de strategie et verifies en TO TEST.

## Anti-patterns

- Ecrire le code de production dans ce skill.
- Ecrire les tests sans faire valider la strategie.
- Creer des stubs vides du composant pour faire compiler les tests.
- Ignorer les criteres d'accessibilite ou de responsive testables.
