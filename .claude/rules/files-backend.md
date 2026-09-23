---
globs: ["apps/api/**"]
---

# Conventions de fichiers : backend

Comment on nomme un fichier, quand on le decoupe, et ou il vit avec son test.
Le decoupage en couches est dans `architecture-backend.md`.

## Nommage des fichiers

**camelCase** partout, sans point ni tiret : `rootController.ts`, `errorHandler.ts`, `usersRoutes.ts`, `usersService.ts`.

Le suffixe de couche depend de la place du fichier dans sa couche : **fichier principal** ou **module**.

**Le fichier principal d'une couche porte le suffixe de sa couche** (`...Controller`, `...Routes`, `...Service`, `...Repository`). Il y en a 1 seul par domaine et par couche.

**Un module a l'interieur d'une couche est nomme par son role, sans suffixe de couche.** Quand un service est decoupe en plusieurs fichiers, seul l'orchestrateur garde `...Service` ; les modules prennent le nom de ce qu'ils font : `usersValidation.ts`, `usersFormat.ts`.

## Quand decouper un fichier en modules

**Un fichier, une responsabilite.** Des qu'un fichier de couche mele plusieurs responsabilites independantes, on le decoupe en modules, un par responsabilite, et l'orchestrateur garde le suffixe de couche.

Le signal concret : **si on ressent le besoin de tracer des bandeaux de commentaires pour separer des sections d'un fichier, c'est que ces sections veulent devenir des modules.**

Calibrage : on decoupe par responsabilite **reellement independante**, pas mecaniquement. 2 morceaux qui changent toujours ensemble et ne se comprennent qu'ensemble restent dans le meme fichier.

## Ou vit un fichier et son test

Des qu'un fichier de prod a un test, les 2 vivent ensemble dans un dossier au nom du fichier qu'ils couvrent. Ca vaut a toutes les couches et pour les modules d'un service.

Un module **sans** test propre reste a plat dans le dossier du domaine : on ne cree un dossier que pour une **paire**.

```
services/users/
├── usersService/
│   ├── usersService.ts
│   └── usersService.test.ts
├── usersFormat/
│   ├── usersFormat.ts
│   └── usersFormat.test.ts
└── usersValidation.ts     # module sans test propre : a plat
```
