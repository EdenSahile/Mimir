---
globs: ["apps/api/**"]
---

# Architecture du backend

Le decoupage est **par couche technique**, pas par domaine. Cette structure est figee : ne pas ajouter de dossier de premier niveau sous `src/` sans accord explicite de l'utilisateur.

```
src/
├── index.ts          # demarrage du serveur : lit la config, ecoute. Rien d'autre.
├── app.ts            # assemblage de l'app Express. Ne connait aucune route.
├── config/           # configuration (variables d'environnement...)
├── middlewares/      # middlewares Express (404, erreurs, validation d'entree...)
├── routes/           # declaration des routes. Aucun corps de handler.
├── controllers/      # les handlers : lire la requete, appeler un service, repondre.
├── services/         # la logique metier. Ne connait ni Express, ni req, ni res.
├── repositories/     # l'acces aux donnees. Implemente les interfaces de repository des services.
└── types/            # types partages entre plusieurs couches (contrat d'API avec le front).
```

## Le role de chaque emplacement

**`index.ts`** : le point d'entree. Il cree l'app et l'ecoute sur le port. Aucune route, aucun middleware ici.

**`app.ts`** : il assemble, dans cet ordre : les middlewares globaux (`express.json()`...), le router principal, le 404, puis le middleware d'erreur. Il importe `routes` et rien de plus : **`app.ts` ne doit jamais declarer une route lui-meme**.

**`routes/index.ts`** : le router principal. Il monte les routers des autres fichiers de `routes/`. C'est le seul endroit a modifier quand on branche un nouveau groupe de routes.

**`routes/`** : un fichier par groupe de routes. Chaque fichier ne contient que des associations methode + chemin + handler importe. **Interdit d'ecrire le corps d'un handler dans `routes/`**, meme pour une reponse d'une ligne.

**`controllers/`** : un fichier par groupe de routes, qui exporte les handlers. Un controller lit `req`, appelle un service, ecrit dans `res`. Il ne contient pas de logique metier. **La validation d'entree ne se fait pas non plus dans le controller** : elle passe par le middleware `validateBody` monte sur la route, qui refuse en `400` (`ApiError`) avant le handler et pose les donnees validees dans `res.locals.body`. Les validateurs eux-memes (fonctions pures, testees) vivent dans la couche `services/`.

**`services/`** : la logique metier, en fonctions qui prennent et rendent des donnees. **Un service ne recoit jamais `req` ni `res`** et n'importe jamais Express.

**`repositories/`** : l'acces aux donnees (Prisma/Postgres). Un repository implemente une **interface declaree par le service** (le *port*) : le service dit ce dont il a besoin, le repository le remplit avec la vraie base. Le service recoit son repository **par injection** et ne connait jamais Prisma ; en test, on injecte un faux repository. Un repository ne recoit jamais `req` ni `res`.

**`types/`** : les types utilises par plusieurs couches, qui n'appartiennent a aucun service en particulier. Un fichier de `types/` ne contient que des types et n'importe rien des autres couches.

## Sens des dependances

`routes/` → `controllers/` → `services/`, jamais l'inverse.

L'acces aux donnees passe par `repositories/`, avec une dependance **inversee** : le service definit l'interface du repository (le *port*), le repository l'implemente ; le service n'importe jamais un repository. C'est le controller qui compose les 2, en injectant le vrai repository dans le service.
