---
globs: ["apps/web/**"]
---

# Imports : frontend

Le projet utilise l'alias `@/` qui pointe sur `src/`.

## La regle

**Alias `@/` pour tout import interne.** `import X from '@/components/ui/Logo'`, jamais `'../../ui/Logo'`. Ca reste lisible et ne casse pas quand on deplace un fichier.

**Toujours `@/`, y compris pour un voisin du meme dossier** : un test vers sa prod s'ecrit `@/logic/user/validation/validation`. Ni `./` ni `../` dans `src/`.

Les imports de paquets externes (`react`, `zod`...) restent des specifiers nus.

## Exception : `e2e/`

Le dossier `e2e/` est a la racine du repo, donc **hors de `src/`, donc hors de portee de l'alias**. Un import entre fichiers de `e2e/` se fait en relatif.

## Ou l'alias est cable

`paths` dans le `tsconfig`, et `vite-tsconfig-paths` pour que Vite et Vitest le resolvent. Quand un import en `@/` ne resout pas, verifier ces 2 reglages avant de retomber sur un chemin relatif.
