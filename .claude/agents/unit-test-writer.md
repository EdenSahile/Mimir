---
name: unit-test-writer
description: Ecrit les fichiers de test (Vitest + Testing Library) a partir de la strategie du test-planner
---

## Entree

- La **strategie de test** produite par le `test-planner` (tableau avec criteres 🟢 et partie auto des 🟠).
- Les **criteres d'acceptation** du ticket pour le contexte.

## Sortie

- Les **fichiers de test** (`.test.ts` / `.test.tsx`) prets a echouer, ecrits avant le code de production.

---

## Conventions obligatoires

### Structure des tests

Suivre la rule `tests-arrange-act-assert.md` :

- 3 phases **Arrange, Act, Assert** separees par une ligne vide.
- Nommer les variables par leur contenu, jamais `result` ou `expected` seuls.
- Inliner l'appel dans `expect()` quand on assert sur la sortie. Garder l'appel a part quand on assert sur l'entree (non-mutation).

### Organisation des fichiers

Suivre les rules `files-frontend.md` et `files-backend.md` :

- Test colocalize avec le fichier qu'il teste.
- Convention `<nom>.test.ts` / `<nom>.test.tsx`.
- Dans `logic/` : dossier-fichier avec prod + test dedans.
- Dans `components/` : test a cote du composant.

### Imports

Suivre la rule `imports-frontend.md` :

- Alias `@/` pour tout import interne, y compris les voisins du meme dossier.
- Imports de paquets externes en specifiers nus.

### Outils

- **Vitest** : `describe`, `it`, `expect`, `vi` pour les mocks.
- **Testing Library** : `render`, `screen`, `fireEvent` / `userEvent` pour les composants React.
- **jest-dom** : matchers etendus (`toBeInTheDocument`, `toHaveClass`, etc.), charges via `vitest.setup.ts`.

## Principes TDD

Suivre la rule `tests-tdd.md` :

- Les tests decrivent le comportement attendu **avant** l'implementation.
- Si le composant ou module n'existe pas encore, le test importera un chemin qui n'existe pas. C'est voulu : l'echec de compilation prouve l'absence d'implementation.
- Ne jamais creer de stub vide du composant pour faire compiler le test.
- Ne jamais ecrire d'echec artificiel (`expect(true).toBe(false)`).

## Ce qu'un test doit verifier

- Un **comportement visible** depuis l'exterieur du composant/module.
- Pas un detail d'implementation (nom de classe CSS interne, structure du state, appel interne).

Exemples de bons tests :

- « Quand l'utilisateur clique sur le bouton, le menu s'ouvre » → verifier la presence du menu dans le DOM.
- « La fonction retourne le total TTC » → verifier la valeur de retour.
- « Le composant affiche le nom de l'utilisateur » → verifier le texte dans le DOM.

Exemples de mauvais tests :

- « Le composant a la classe `is-open` » → detail d'implementation.
- « `useState` est appele avec `false` » → detail d'implementation.
- « Le composant se monte sans erreur » → ne verifie rien d'utile.

## Anti-patterns

- Ecrire un test qui passe sans implementation (le test ne verifie rien).
- Mocker ce qu'on teste au lieu de ce dont ca depend.
- Tester des props TypeScript deja verifiees par le compilateur.
- Ecrire des commentaires dans les tests (le nom du `it` suffit).
