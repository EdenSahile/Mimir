---
globs: ["apps/web/**"]
---

# Architecture : frontend

Le decoupage est **par couche technique**, pas par ecran. Cette structure est figee : ne pas ajouter de dossier de premier niveau sous `src/` sans accord explicite de l'utilisateur.

```
src/
├── main.tsx          # point d'entree : monte l'app dans le DOM. Rien d'autre.
├── App.tsx           # assemblage de l'app : providers et routes.
├── components/       # l'affichage. 2 sous-dossiers, pas un de plus.
│   ├── ui/           # les composants generiques, reutilises par 2+ ecrans.
│   └── pages/        # un dossier par ecran, avec ses morceaux specifiques.
├── logic/            # la logique metier. Ne connait ni React, ni le DOM, ni le reseau.
├── lib/              # la couche infra : ce qui parle a l'exterieur.
│   └── api/          # le seul endroit qui connait le reseau.
├── data/             # le contenu statique des ecrans (textes, labels).
├── types/            # le contrat d'API partage avec le backend.
└── assets/           # les images utilisees au runtime.
```

## Le role de chaque emplacement

**`main.tsx`** : monte l'app dans le DOM et importe la feuille de style globale. Aucune route, aucun provider ici.

**`App.tsx`** : assemble les providers (client de requetes, router...) puis la declaration des routes. Aucun morceau d'interface.

**`components/ui/`** : tout ce qui est **generique et reutilise par 2 ecrans ou plus** : boutons, champs, cartes, logo, titres. C'est aussi la que la CLI shadcn depose les composants.

**`components/pages/<Ecran>/`** : la page **et tous ses morceaux specifiques** groupes dans son dossier. Un composant reste ici tant qu'un seul ecran l'utilise ; il ne remonte dans `ui/` que le jour ou un 2e ecran le reutilise.

**Pas de 3e dossier sous `components/`.** Ni `layout/`, ni `shared/`, ni `common/`, ni `features/`.

**`logic/`** : la logique metier, en fonctions pures qui prennent et rendent des donnees. **Elle n'importe ni React, ni un composant, ni `lib/api/`** : elle doit rester appelable depuis un test sans navigateur et sans reseau. C'est l'equivalent frontend de la couche `services/` du backend.

**`lib/`** : la couche **infra** : tout ce qui adapte le monde exterieur au projet.

- **`lib/api/`** est le seul endroit qui connait le reseau : l'URL de l'API, la forme des erreurs, un fichier par domaine, et les cles de cache. Equivalent frontend de la couche `repositories/` du backend.
- La configuration des librairies tierces vit a la racine de `lib/`.
- **Exception assumee : `lib/utils.ts`.** Il ne contient que `cn()`, le helper de fusion de classes CSS. Il est la parce que c'est l'emplacement par defaut de shadcn, declare dans `components.json` sous `aliases.utils`. **Ne pas le deplacer.** Cette exception ne s'etend a rien d'autre.

**`data/`** : le **contenu statique des ecrans** : titres, labels, placeholders, libelles de boutons. Ce ne sont pas des bouchons en attendant l'API, ces fichiers restent quand l'API arrive. Une donnee qui vient du serveur ne se range jamais ici.

**`types/`** : le contrat d'API partage avec le backend.

**`assets/`** : uniquement les images reellement utilisees au runtime, en noms semantiques.

## Sens des dependances

`components/` → `logic/` et `components/` → `lib/api/`, jamais l'inverse.

- Un composant peut appeler la logique metier et declencher une requete.
- **`logic/` n'importe jamais un composant ni `lib/api/`.** Si une fonction metier a besoin d'une donnee du serveur, elle la recoit en parametre.
- **`lib/api/` n'importe jamais un composant ni `logic/`.** Il transporte des donnees, il ne decide rien.
- `data/` et `types/` ne dependent de rien : ce sont des feuilles.
