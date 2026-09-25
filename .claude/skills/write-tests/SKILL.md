---
name: write-tests
description: Ecrit tous les tests d'un ticket AVANT l'implementation, en lisant l'inventaire produit par test-planner et en lancant test-writer. Exige l'inventaire, ne le produit pas. Utiliser quand l'utilisateur dit "write-tests", "ecris les tests", "on commence les tests", "TDD".
---

## Entree

- L'**inventaire des tests** du ticket : `testing/strategie-MIM-X.md`, produit en amont par `test-planner`. C'est lui qui decide quels tests ecrire.

## Sortie

- Les **fichiers de test** ecrits et commites.
- La **confirmation que les tests detectent l'absence du comportement** (red).

---

## Regles

- **Pas d'inventaire, pas de tests.** Si `testing/strategie-MIM-X.md` n'existe pas, s'arreter et demander a lancer `test-planner` d'abord. Ne jamais classer les criteres soi-meme pour enchainer.
- **Un seul lancement de `test-writer`**, pas un par critere. L'agent recoit toute la strategie d'un coup.
- **Ne rien ecrire soi-meme**, meme « juste un petit test » : tout passe par l'agent, c'est ce qui garantit l'application de ses conventions.
- **Les tests sont ecrits AVANT le code de production.** Jamais de code de prod avant ce skill.
- **Les smoke tests 🔴 ne produisent pas de fichier de test.** Ils sont decrits dans l'inventaire et verifies en TO TEST.

## Etapes

### 1. Verifier l'inventaire

Chercher `testing/strategie-MIM-X.md` (X = numero du ticket, extrait du nom de branche `MIM-\d+`).

S'il n'existe pas : **stop**, dire de lancer `test-planner` d'abord.

### 2. Lire l'inventaire

Ouvrir le fichier et identifier :
- Les criteres 🟢 (test auto complet).
- La part auto des criteres 🟠.
- Les criteres 🔴 (hors perimetre de ce skill).

### 3. Lancer test-writer

Dispatcher l'agent `test-writer` avec :
- La strategie validee (criteres 🟢 et part auto des 🟠).
- Les criteres d'acceptation du ticket pour le contexte.

Le writer produit les fichiers `.test.ts` / `.test.tsx`.

### 4. Verifier le red

Executer `pnpm test` dans le workspace concerne.

- Si les tests ne compilent pas (import manquant), c'est attendu : le module n'existe pas encore. Le noter et continuer.
- Si les tests compilent et echouent, c'est le cas classique : red confirme.
- Si un test passe sans implementation, il y a un probleme : le test ne verifie rien d'utile. Le corriger.

### 5. Commiter

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

## Anti-patterns

- Ecrire le code de production dans ce skill.
- Lancer les tests sans inventaire prealable.
- Creer des stubs vides du composant pour faire compiler les tests.
- Ignorer les criteres d'accessibilite ou de responsive testables.
