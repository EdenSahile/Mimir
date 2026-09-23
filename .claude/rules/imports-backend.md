---
globs: ["apps/api/**"]
---

# Imports : backend

Le projet est en ESM (`"type": "module"`, `moduleResolution: NodeNext`) et utilise l'alias `@/` qui pointe sur `src/`.

## La regle

**Les imports internes passent par `@/`, jamais par `./` ni `../`**, et gardent l'extension `.js` (NodeNext l'exige), meme si le fichier source est un `.ts`.

```ts
import { getRoot } from '@/controllers/rootController.js'
```

Les imports de paquets externes (`express`, `zod`...) restent des specifiers nus, sans alias ni extension.

## Ou l'alias est cable

Il tient a **4 endroits**, et un seul oublie casse un des modes d'execution sans casser les autres :

- `paths` dans `tsconfig.json`, pour le typecheck ;
- `tsx`, qui le resout en developpement ;
- `vite-tsconfig-paths`, pour Vitest ;
- `tsc-alias`, qui reecrit `@/` en relatif dans `dist/` au build (`tsc` ne le fait pas seul).

Quand un import en `@/` ne resout pas, verifier lequel des 4 manque avant de retomber sur un chemin relatif.
