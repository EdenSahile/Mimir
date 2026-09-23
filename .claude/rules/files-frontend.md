---
globs: ["apps/web/**"]
---

# Conventions de fichiers : frontend

## Un fichier = une unite

- **Un composant par fichier.** Jamais 2 composants exportes depuis le meme fichier. Un composant = un fichier a son nom, export par defaut.
- **Un SVG par fichier.**
- Exception unique : un sous-composant purement prive, jamais reutilise et trivial, peut rester dans le fichier de son parent. Des qu'il a un nom propre ou qu'il pourrait etre importe ailleurs, il sort dans son fichier.

## Nommage des fichiers

**Un fichier qui exporte un composant React est en PascalCase**, au nom exact du composant : `Navbar.tsx`, `PageHeading.tsx`, `TextField.tsx`.

**Tout le reste est en camelCase**, sans point ni tiret : `queryKeys.ts`, `validation.ts`, `format.ts`. Vaut pour `logic/`, `lib/`, `data/` et `types/`.

**Exception assumee : les composants generes par shadcn restent en kebab-case** (`alert-dialog.tsx`, `card.tsx`, `sonner.tsx`). **Ne pas les renommer.** Un composant ecrit a la main dans `components/ui/`, lui, suit la regle PascalCase.

## Modules groupes par domaine

**Un module = un domaine.** Des qu'un fichier regroupe plusieurs domaines independants, il s'eclate, un fichier par domaine.

Dans `src/logic/`, on descend a **2 niveaux de dossier**. Chaque unite de logique a son **dossier-fichier** (nomme comme elle, contenant `<nom>.ts` et son `<nom>.test.ts`), et ces dossiers-fichiers sont ensuite **regroupes par domaine**.

- **Un dossier-fichier par unite, prod et test dedans.** `user/validation/validation.ts` + `user/validation/validation.test.ts`.
- **Pas de prefixe de domaine ni de repetition dans le nom.** Le dossier de domaine porte deja le domaine : `user/validation/validation.ts`, jamais `user/userValidation/...`.
- **Pas de barrel `index.ts`.** Les imports pointent le fichier precis : `@/logic/user/validation/validation`.

## Fichiers de test

- **Colocalises : le test vit a cote de ce qu'il teste.** `format.ts` → `format.test.ts` dans le meme dossier. Jamais dans un dossier `tests/` separe.
- **Convention de nommage : `<nom>.test.ts` / `<nom>.test.tsx`** (le defaut de Vitest).
- **Exception : le end-to-end.** Un parcours Playwright ne teste aucun fichier precis, il traverse toute l'app → dossier dedie `e2e/` a la racine.
