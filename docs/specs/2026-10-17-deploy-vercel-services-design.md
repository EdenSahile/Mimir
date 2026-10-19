# Déploiement du backend sur Vercel (MIM-37)

**Date :** 2026-10-17
**Ticket :** MIM-37 « Déployer frontend et backend »
**Branche :** `chore/MIM-37-deploy-vercel-services`
**Décisions liées :** DEC-005 (hébergement Vercel), DEC-011 (Better Auth, point 2 amendé), DEC-012 (nouvelle)

## Constat du 2026-10-18 : la « base de preview » était la base de production

Vérifié par l'utilisateur dans la console Neon. La branche Neon que `DATABASE_URL` de l'environnement **Preview** désigne sur Vercel est la branche de **production**. Il n'existe pas de branche de preview distincte.

**Depuis quand.** L'API Vercel date les 3 entrées Preview du **2026-10-16 entre 15:55 et 15:59**, contre le 2026-10-08 pour les 5 entrées Production. Les previews n'écrivent donc en production que depuis la création de ces entrées, et non depuis l'origine du projet. À noter aussi, contre une idée répandue dans ce ticket : il y a bien **2 entrées distinctes** par variable, une par portée. Il n'y a donc rien à dédoubler, c'est la **valeur** de l'entrée Preview qui est à changer.

Ce que ça implique, et qui doit être traité avant toute suite :

1. Les déploiements de preview **lisent et écrivent dans la base de production**.
2. Les comptes créés pendant la validation (inscriptions manuelles, compte témoin, comptes des 2 exécutions e2e) sont **dans la base de production**.
3. Le `P3009` qui bloque les builds est une ligne de migration en échec dans l'historique de la **production**.
4. Les 2 builds de preview qui ont lancé `prisma migrate deploy` l'ont donc lancé **contre la production**. La tentative du 2026-10-17 à 20:48 UTC a échoué sur `column "emailVerified" already exists`, et c'est cet échec qui a protégé la base : si elle était passée, un build de preview aurait modifié la production sans qu'aucune décision soit prise.
5. **La section « Migrations » de cette spec et la décision correspondante de DEC-012 sont annulées en fait** : « migrer en preview, jamais en production » ne veut rien dire tant que les 2 désignent la même base.
6. Si Deployment Protection avait été désactivée comme la première version de DEC-012 le prévoyait, une inscription ouverte écrivant dans la production aurait été exposée publiquement.

**La cause.** Une branche a été nommée par son **rôle dans Vercel** (« la variable s'appelle Preview, donc c'est la base de preview ») au lieu de son **identité chez le fournisseur**. Toute la cartographie, les garde-fous et le dispositif de migration ont été construits sur ce nom, jamais sur une vérification.

### Les 2 règles qui manquaient

**L'identité d'une base cible se vérifie dans la console du fournisseur, jamais d'après le nom d'une variable d'environnement.** Un nom de variable dit quel environnement la lit, pas quelle base elle désigne. Les 2 ne coïncident que si quelqu'un l'a vérifié.

**Un garde-fou que l'agent peut éditer est un pense-bête, pas un contrôle.** L'agent qui écrit le verrou détient aussi la clé : il peut élargir une liste blanche aussi facilement qu'il l'a écrite. Les seuls contrôles réels sont ceux que l'utilisateur détient, les identifiants et la vérification à la source. Démonstration dans cette session même : la liste blanche codée en dur du commit `7330824` contenait **l'endpoint de production** pour `migrate reset`, présenté comme « le dernier rempart ». Ce qui a réellement protégé la base, c'est que l'utilisateur n'a pas fourni les identifiants, puis que le passage en variables d'environnement a hérité de fichiers qui ne listent que les bases de développement et de test.

**Règle absolue qui en découle : l'endpoint de production n'entre dans aucune liste blanche, ni `reset`, ni `push`, jamais.** Si une opération exige de l'y ajouter, elle est refusée et signalée.

#### Le cas du commit `7330824`, l'enseignement le plus utile de ce ticket

Le commit `7330824` introduit le garde-fou sur `migrate reset`, annoncé comme « le dernier rempart contre une faute de frappe sur un fichier d'environnement ». Son code :

```ts
const RESET_ALLOWED_HOSTS = [...PUSH_ALLOWED_HOSTS, "ep-sweet-paper-b2d3bg45"]
```

Cette liste **autorisait explicitement `migrate reset` sur la base de production**, parce que l'endpoint y avait été ajouté sous le nom de « base de preview ». Le rempart annoncé laissait donc passer précisément l'opération contre laquelle il était censé protéger, et il a été écrit, commenté, testé et présenté comme un contrôle.

Ce qui a réellement protégé la base, dans l'ordre : l'utilisateur n'a pas fourni les identifiants ; puis le passage des listes en variables d'environnement a hérité de fichiers locaux qui ne déclarent que les bases de développement et de test. Deux fois la protection est venue de l'utilisateur, jamais du dispositif.

À retenir pour tout garde-fou futur : un contrôle écrit par celui qu'il est censé contraindre ne vaut que ce que vaut l'information qu'il contient, et cette information venait ici d'une supposition. Le contrôle réel reste la détention des identifiants.

#### Les 2 rotations de secrets, qui n'ont pas la même cause

À ne pas confondre, parce qu'elles protègent de 2 choses différentes et ne se déclenchent pas pour les mêmes raisons.

**1. Rotation de `BETTER_AUTH_SECRET`, en Production et en Preview.** Cause : la même valeur était déclarée dans les 2 portées, donc un jeton signé depuis un preview **aurait valu** en production. Ce secret signe aussi des jetons sans état, vérification d'email et réinitialisation de mot de passe, que la base ne peut pas révoquer.

**Portée réelle du problème, plus faible qu'annoncée d'abord.** Le projet Vercel ne déploie aujourd'hui que le frontend : ce chantier est le premier déploiement du backend, et il vit sur une branche non fusionnée. **Aucune API ne tourne donc en production, aucun jeton n'y est validé, et le `BETTER_AUTH_SECRET` de Production n'a jamais signé quoi que ce soit.** Le partage était une bombe amorcée pour le premier déploiement réel de l'API, pas une compromission en cours. Même raisonnement pour les comptes de test arrivés dans la base de production : ils y sont entrés **par les previews**, jamais par la production, qui n'a pas d'API.

Conséquence pratique : il n'y a **rien à redéployer**. Changer la valeur suffit, elle sera lue au premier déploiement réel de l'API. Aucune session à invalider, puisqu'aucune n'a été ouverte par une API de production. Ordre conservé, Production d'abord puis Preview, pour que l'interruption de la procédure laisse la production sur une valeur neuve et jamais partagée.

Enseignement à côté du reste : cette correction vient d'un fait de l'environnement, la production n'exécute pas encore d'API, que j'avais ignoré en décrivant la gravité. Évaluer un risque demande de savoir ce qui tourne, pas seulement ce qui est configuré.

**2. Rotation des mots de passe des rôles Neon, sur les 3 branches.** Cause : les endpoints des 3 branches figurent dans l'historique d'un dépôt public, celui de production via le commit `7330824`. Un endpoint n'est pas un identifiant, mais c'est la moitié d'une chaîne de connexion : le mot de passe devient le seul élément qui protège l'accès, donc il est renouvelé. Sans rapport avec l'authentification de l'application.

#### Exposition de l'endpoint de production, et décision

Le commit `7330824` est poussé sur un dépôt public : l'endpoint de la branche de production figure donc dans l'historique. **Décision de l'utilisateur : ni réécriture de l'historique, ni recréation de la branche Neon.** Motif : un endpoint n'est pas un identifiant, il ne donne accès à rien seul, et une réécriture d'historique serait cosmétique puisque les objets restent accessibles par leur SHA. Le seul élément réellement sensible est le mot de passe, et **les mots de passe des 3 branches Neon sont mis en rotation**. Le sujet est clos, il n'a pas à être rouvert.

### Correctif de fond

Le ticket « une branche Neon éphémère par déploiement de preview » n'est plus une amélioration pour plus tard : c'est **le correctif de fond de ce constat**, et il passe en priorité. Tant qu'il n'est pas fait, une branche Neon de preview créée à la main depuis la production tient le rôle.

## Problème

Le frontend est déployé sur Vercel et accessible. Le backend Express ne l'est pas. Conséquence : toute fonctionnalité qui appelle l'API ne marche pas en production, l'authentification comprise. MIM-23 est en `TO TEST` et reste bloqué par ce point.

## Objectif

Déployer `apps/api` sur Vercel, dans le même projet que `apps/web`, derrière le même domaine, et valider la chaîne d'authentification complète sur un déploiement de preview.

## Critère de réussite

Sur une URL de preview, dans cet ordre : `/api/health` répond, l'inscription aboutit, la connexion aboutit, le cookie de session est posé sur le domaine du preview, et `/api/me` renvoie l'utilisateur avec ce cookie.

---

## Architecture retenue

### 1 projet Vercel, 2 services

Vercel Services permet de déclarer plusieurs unités construites séparément mais déployées ensemble, sous un domaine unique et une URL de preview unique. Un « service », ici, c'est un morceau de l'application avec son propre dossier racine et son propre build.

Les backends d'un projet Services tournent comme des Vercel Functions sur Fluid Compute, ce qui reste conforme à DEC-005 (« le backend tournera en fonctions serverless »). Le modèle d'exécution ne change pas, seule la déclaration change.

Conséquence centrale : le frontend et l'API partagent la même origine. Plus de CORS en production, plus de cookie cross-site, plus de `VITE_API_URL`.

### `vercel.json` cible

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "web": {
      "root": "apps/web",
      "framework": "vite",
      "buildCommand": "pnpm build",
      "outputDirectory": "dist",
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    },
    "api": {
      "root": "apps/api",
      "framework": "express",
      "buildCommand": "pnpm --filter @mimir/db generate && pnpm bundle",
      "entrypoint": "dist/index.js"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": { "service": "api" } },
    { "source": "/(.*)", "destination": { "service": "web" } }
  ]
}
```

Points de conception :

- **Les `rewrites` du haut sont évalués dans l'ordre.** `/api/*` part vers le service `api`, le reste vers `web`. Le catch-all SPA est confiné au service `web` et ne peut donc plus intercepter `/api/*`.
- **Un service est privé par défaut.** Sans `rewrite` de premier niveau qui le cible, il ne reçoit aucun trafic public.
- **Les champs de build ne sont plus valides au premier niveau** quand `services` est présent. `buildCommand`, `installCommand`, `outputDirectory` et `framework` descendent dans le service qui les possède.
- **`framework` est épinglé explicitement** au lieu de compter sur la détection automatique, parce que le point d'entrée de l'API est un bundle JavaScript nu et non du code Express reconnaissable.
- **`entrypoint` est un chemin de fichier pour Node.js**, relatif à la racine du service. Il désigne le bundle, ce qui supprime toute ambiguïté de détection avec `src/index.ts`.
- **Le routage vers un service est définitif.** Si le service choisi répond 404, Vercel n'essaie pas la règle suivante.

### Aucune modification du point d'entrée Express

La documentation Express de Vercel liste les emplacements détectés et accepte les 2 formes : export par défaut de l'application, ou `app.listen()`. `apps/api/src/index.ts` utilise `app.listen()` et reste donc valable tel quel.

`apps/api/src/app/app.ts` ne change pas non plus : le handler Better Auth reste monté sur `/api/auth/*` avant `express.json()`, conformément à DEC-011 point 1.

### Bundling de l'API avec esbuild

Vercel compile le TypeScript et élague les fichiers inutiles, mais la documentation est explicite : « does not perform application bundling ». Sans bundling de notre côté, 2 choses ne se résolvent pas au runtime :

1. L'alias `@/`, qui vit dans le `tsconfig` et n'existe pas pour Node.
2. `@mimir/db`, qui expose `"main": "index.ts"`, donc du TypeScript brut non compilé.

La règle de bundling : **externaliser les dépendances npm, n'inliner que l'alias `@/` et les paquets `@mimir/*`.** Un simple « tout externe » laisserait `@mimir/db` non compilé, puisqu'un import `@mimir/db` ressemble à un paquet et serait externalisé comme tel.

**La liste des externes doit agréger 3 `package.json`**, et pas seulement celui de `apps/api`. Raison : `@mimir/db` étant inliné, ses propres imports entrent dans le graphe du bundle. Or `@prisma/client` et `@prisma/adapter-neon` sont déclarés dans `packages/db` et non dans `apps/api`. Une liste bâtie sur le seul `apps/api/package.json` les laisserait donc hors des externes, et esbuild tenterait de bundler Prisma, ce qui est exactement le risque numéro 1 de ce document.

Sont donc agrégées les dépendances de `apps/api`, `packages/db` et `packages/shared`, en excluant uniquement les paquets `@mimir/*`. `packages/shared` n'a aujourd'hui aucune dépendance de runtime, mais il est inclus pour que la règle tienne quand il en aura.

Comme esbuild n'a pas de drapeau pour « externaliser tout sauf ceci », la liste est calculée au build plutôt qu'écrite à la main, ce qui évite qu'elle se périme :

```js
// apps/api/esbuild.config.mjs
import { build } from "esbuild"
import apiPkg from "./package.json" with { type: "json" }
import dbPkg from "../../packages/db/package.json" with { type: "json" }
import sharedPkg from "../../packages/shared/package.json" with { type: "json" }

const externalPackages = [apiPkg, dbPkg, sharedPkg]
  .flatMap((pkg) => Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }))
  .filter((name) => !name.startsWith("@mimir/"))

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  external: [...new Set(externalPackages)],
})
```

Avec, dans `apps/api/package.json`, un script `"bundle": "node esbuild.config.mjs"` et **esbuild déclaré en `devDependency` explicite de `@mimir/api`**, sans dépendre de l'esbuild transitif de Vite.

`target: "node24"` suit le Node 24 du dépôt. **Vérifié** le 2026-10-18 par `vercel project inspect` : le projet est sur `Node.js Version 24.x`, donc le bundle et le runtime concordent.

### `prisma generate` dans le build

`pnpm-workspace.yaml` met `allowBuilds` à `false` pour `prisma`, `@prisma/client`, `@prisma/engines` et `esbuild`. Les scripts de build de ces paquets ne tournent donc pas à l'installation, et la génération du client Prisma doit être appelée explicitement. C'est le même bug que la PR #59 a corrigé sur la CI.

D'où `pnpm --filter @mimir/db generate` en tête du `buildCommand` du service `api`. La forme `--filter` est utilisée parce que `db:generate` est un script de la racine du monorepo, introuvable depuis `apps/api`.

### Authentification same-origin

**Côté client**, `baseURL` disparaît complètement de `authClient.ts`. Le client Better Auth tape alors la même origine sur son chemin par défaut, `/api/auth`, qui est exactement là où le serveur monte le handler.

En développement, `apps/web/vite.config.ts` renvoie déjà `/api` vers `http://localhost:3001`. Le développement devient donc same-origin lui aussi, sans rien ajouter côté Vite. C'est ce qui amende DEC-011 point 2.

**Côté serveur**, `env.ts` distingue 3 situations :

| Environnement | `frontendUrl` et `betterAuthUrl` |
|---|---|
| Production | variables fixes `FRONTEND_URL` et `BETTER_AUTH_URL` |
| Preview | `https://` + `VERCEL_URL` |
| Développement | replis locaux, 5173 pour le front et 3001 pour l'API |

```ts
function vercelPreviewUrl(): string | undefined {
  if (process.env.VERCEL_ENV !== "preview") return undefined
  const host = process.env.VERCEL_URL
  return host ? `https://${host}` : undefined
}
```

Pourquoi ne pas dériver aussi la production de `VERCEL_URL` : cette variable porte l'URL générée propre au déploiement, un `*.vercel.app`, et non le domaine personnalisé. S'en servir en production enverrait les cookies et les origines de confiance sur le mauvais hôte. Elle ne contient pas non plus le protocole, d'où le `https://` ajouté à la main.

`VERCEL_PROJECT_PRODUCTION_URL` existe et vise le domaine de production, mais garder des variables fixes en production reste plus explicite et ne dépend pas d'une heuristique de « plus court domaine ».

`auth.ts` n'a **aucune modification** à subir : `trustedOrigins: [frontendUrl]` suit automatiquement la bonne valeur dans les 3 environnements.

CORS devient inutile en preview et en production, mais **reste en place pour l'instant**. Son retrait est un sujet séparé, à traiter dans un second temps.

### `/health` devient `/api/health`

`/health` est hors de `/api`, donc le catch-all du service `web` l'intercepterait et renverrait le `index.html` du frontend. La route se déplace franchement, sans conserver l'ancien chemin.

4 emplacements à corriger, relevés par recherche :

| Fichier | Nature |
|---|---|
| `apps/api/src/routes/healthRoutes.ts` | la définition de la route |
| `apps/api/src/app/app.test.ts` lignes 21 à 28 | 2 tests |
| `playwright.config.ts` ligne 34 | URL d'attente du serveur |
| `testing/strategie-MIM-23.md` | 3 mentions |

---

## Changements fichier par fichier

| Fichier | Changement |
|---|---|
| `vercel.json` | réécrit en mode `services` |
| `apps/api/esbuild.config.mjs` | nouveau, le bundle |
| `apps/api/package.json` | script `bundle`, esbuild en `devDependency`, `@prisma/client` et `@prisma/adapter-neon` en `dependencies` (voir risque 2) |
| `apps/api/src/config/env/env.ts` | dérivation preview depuis `VERCEL_URL` |
| `apps/api/src/config/env/env.test.ts` | tests de la dérivation preview |
| `apps/api/src/routes/healthRoutes.ts` | `/health` vers `/api/health` |
| `apps/api/src/app/app.test.ts` | 2 tests mis à jour, 1 test ajouté sur `x-powered-by` |
| `apps/api/src/app/app.ts` | `app.disable("x-powered-by")` |
| `apps/api/vercel.entry.js` | nouveau, la passerelle d'entrypoint |
| `apps/web/src/lib/authClient.ts` | suppression de `baseURL` |
| `apps/web/src/lib/authClient.test.ts` | réécrit |
| `apps/web/vite.config.ts` | `strictPort: true` |
| `playwright.config.ts` | URL d'attente mise à jour, mode preview avec contournement de protection |
| `e2e/globalSetup.ts` | pas de reset de base en mode preview, `--skip-generate` retiré |
| `scripts/db-deploy.sh` | nouveau, les migrations de production |
| `package.json` | script `db:deploy` |
| `packages/db/prisma.config.ts` | `url` du CLI délégué à `cliDatasource` |
| `packages/db/cliDatasource/cliDatasource.ts` | nouveau, le garde-fou `DIRECT_URL` |
| `packages/db/cliDatasource/cliDatasource.test.ts` | nouveau, 13 tests |
| `packages/db/prisma.config.ts` | `shadowDatabaseUrl` pour `migrate diff --from-migrations` |
| `.env.example` | les 2 listes blanches documentées |
| `packages/db/audit.ts` | nouveau, la mesure en lecture seule |
| `scripts/db-audit.sh` | nouveau, `pnpm db:audit` |
| `.claude/rules/bases-et-identifiants.md` | nouveau, identifiants et actes d'exploitation |
| `CLAUDE.md` | `db:push` restreint aux bases locale et de test, `db:deploy` documenté |
| `packages/db/package.json` | script `test`, vitest en `devDependency` |
| `e2e/helpers.ts` | `skipsDatabaseAssertions` |
| `e2e/signup.spec.ts` | assertion en base conditionnée au mode local |
| `e2e/session-persistence.spec.ts` | assertion en base conditionnée au mode local |
| `testing/strategie-MIM-23.md` | 3 mentions mises à jour |
| `docs/decisions.md` | DEC-012 et amendement DEC-011 point 2 |
| `docs/roadmap.md` | rappel de réactivation retiré, DEC-012 ne désactive plus rien |

Fichiers explicitement **non modifiés** : `apps/api/src/index.ts`, `apps/api/src/config/auth.ts`.

**Pourquoi `app.ts` a finalement bougé.** Un en-tête `x-powered-by: Express` était visible sur les réponses du preview. Express l'envoie par défaut et il ne sert qu'à renseigner un attaquant sur la stack à cibler. `app.disable("x-powered-by")` le supprime, avec un test dans `app.test.ts`.

**Pourquoi `vite.config.ts` a finalement bougé.** Le proxy `/api` y existait déjà et n'avait rien à changer, mais le passage en same-origin a rendu le port du frontend significatif. Avant, `baseURL` pointait en dur sur le port 3001 et le port du serveur de dev n'avait aucune importance. Maintenant le navigateur appelle sa propre origine : si Vite se rabat sur un autre port parce que 5173 est pris, cette origine ne correspond plus à `trustedOrigins` et l'authentification casse sans message clair. `strictPort: true` fait échouer le démarrage franchement au lieu de glisser en silence.

## Réglages à faire sur Vercel, hors code

1. **Le réglage Framework : rien à changer, et la contrainte citée appartient à l'autre modèle.** Il existe 2 modèles de configuration, et ils n'ont pas les mêmes règles. La page de `experimentalServices`, l'ancien, écrit : « To deploy a project that uses multiple services, your project framework setting must be set to Services and `experimentalServices` must be present in `vercel.json` ». La page de `services`, le modèle courant et celui utilisé ici, **ne contient pas cette phrase**. La base de connaissances citée dans la première version de cette spec confondait les 2.

Observation concordante, le 2026-10-18 par `vercel project inspect` : le Framework Preset du projet vaut `Other`, et les déploiements ont bien construit 2 services distincts, la première erreur nommant `Service "api"`. La clé `services` a suffi.

**Leçon générale, qui vaut au-delà de ce champ :** `experimentalServices` et `services` ont des règles différentes, et une documentation qui parle de l'un se lit à tort comme parlant de l'autre. Vérifier sur quelle page une contrainte figure avant de l'appliquer. Autre exemple de divergence relevé entre les 2 pages : `experimentalServices` injecte une variable `{SERVICENAME}_URL` par service, donc un service nommé `frontend` écraserait notre `FRONTEND_URL`. Le modèle `services` ne fait pas cette injection, il passe par des bindings explicites, et nos services s'appellent de toute façon `web` et `api`.
2. **Vérifier que l'accès aux variables d'environnement système est activé.** Sans cette case, `VERCEL_ENV` et `VERCEL_URL` n'existent pas, et la dérivation de preview tombe sur le repli de développement.
3. **Ne jamais vider les 3 champs de build du projet.** Valeurs lues le 2026-10-18 par `vercel project inspect` : Build Command `pnpm --filter @mimir/web build`, Output Directory `apps/web/dist`, Install Command `pnpm install --frozen-lockfile`, Root Directory `.`. La première version de cette spec les déclarait inertes en mode `services` et prévoyait de les vider après la fusion. **C'est faux, et c'est ce vidage qui a cassé la production le 2026-10-18.** Ces 3 champs ne gouvernent pas le build des services, mais l'**empaquetage de la fonction**, et ils sont nécessaires : sans eux, le paquet livré n'est pas celui qui démarre. La section « La deuxième panne : les 3 champs de build ne sont pas inertes » donne la mesure et la cause. On n'y touche pas.
4. **Laisser Deployment Protection active, et créer un secret de contournement pour l'automatisation.** Deployment Protection → Protection Bypass for Automation → créer un secret, nommé pour son usage (« Playwright »). Vercel l'expose alors aux déploiements sous `VERCEL_AUTOMATION_BYPASS_SECRET`, et il faut **redéployer** pour qu'un déploiement existant le reçoive. Le même secret est déclaré en secret de dépôt GitHub, `Settings → Secrets and variables → Actions`, pour que la CI puisse viser un preview. Il n'entre jamais dans le dépôt. Motif du maintien de la protection dans DEC-012.
5. **Aucune variable à ajouter, et aucune valeur à comparer.** Preview n'a ni `FRONTEND_URL` ni `BETTER_AUTH_URL` : la dérivation depuis `VERCEL_URL` les remplace. Production garde les siennes.

**La méthode de comparaison des `BETTER_AUTH_SECRET` proposée dans la première version de cette spec était impossible.** Elle reposait sur un `vercel env pull` dans chaque environnement puis sur la comparaison des empreintes. Les 8 variables sont de type `sensitive`, donc leurs valeurs sont illisibles pour tout le monde, et le `pull` rapporte des chaînes vides. Il n'y a rien à comparer : les 2 secrets sont **renouvelés**, chacun avec une valeur neuve, ce qui garantit leur différence sans jamais lire l'ancienne. Aucune étape de la procédure ne suppose de relire une valeur existante, toutes écrivent par-dessus.

## Plan B si Services échoue

Services est en **Beta** sur tous les plans. Si le preview échoue sur cette partie précise, le repli ne touche ni le bundle, ni l'authentification, ni `/api/health` :

- `vercel.json` revient à la forme classique : `buildCommand` et `outputDirectory` au premier niveau pour le frontend, et un `rewrite` SPA qui exclut `/api/*`.
- Le bundle esbuild produit `api/index.js` à la racine du repo, emplacement où Vercel détecte les fonctions par convention, au lieu de `apps/api/dist/index.js`.
- Le fichier généré est ignoré par git.

Les détails de ce repli ne sont pas spécifiés plus loin volontairement : ils ne seront travaillés que s'il sert.

## Résultat de la validation locale du bundle

Le bundle a été construit et exécuté en local (`node dist/index.js` avec les variables d'environnement), avant tout déploiement. 4 des 6 risques sont levés à ce stade :

| Risque | Résultat |
|---|---|
| 1. Bundling de Prisma | **Levé.** Prisma reste un import externe, il n'entre jamais dans le bundle. Le serveur lancé depuis le bundle atteint la vraie base : inscription en `200`, `/api/me` en `200`, `401` sans cookie, `404` sur route inconnue. |
| 2. Résolution des externes depuis `apps/api` | **S'est matérialisé, puis corrigé.** `node dist/index.js` échouait en `ERR_MODULE_NOT_FOUND` sur `@prisma/client`. Correctif appliqué : `@prisma/client` et `@prisma/adapter-neon` déclarés dans les `dependencies` de `@mimir/api`. |
| 4. Alias `@/` | **Levé.** esbuild résout les `paths` du `tsconfig` sans `baseUrl`. 0 alias résiduel dans la sortie. |
| 5. Imports `.js` vers sources `.ts` | **Levé.** esbuild fait la correspondance. |

Le bundle produit fait 3,5 Ko pour 123 lignes : seul notre code est inliné, `@mimir/db` compris, et les dépendances npm restent des imports.

Restent à valider sur le preview : le risque 3 (esbuild et `allowBuilds` sur le build Linux), le risque 6 (commandes en monorepo pnpm) et le risque 7 (syntaxe `services` en Beta).

## Risques à valider sur le preview, par ordre de priorité

1. **Le bundling de Prisma.** C'est le premier point à valider. Le client Prisma généré embarque normalement un binaire de moteur de requête, qui se bundle mal. Ici `@prisma/adapter-neon` est un adaptateur en pur JavaScript qui parle à Neon par HTTP, donc sans binaire, ce qui rend le bundling viable. À confirmer, pas à supposer.
2. **La résolution des externes depuis `apps/api` à l'exécution.** Les paquets externalisés ne sont pas dans le bundle : Node doit donc les trouver dans `node_modules` au runtime. Il n'y a pas de `.npmrc`, donc pnpm est en mode isolé, et `apps/api/node_modules` ne contient que les dépendances déclarées par `apps/api`. `@prisma/client` et `@prisma/adapter-neon` étant déclarés dans `packages/db`, ils ne sont a priori **pas** résolubles depuis `apps/api`. Si c'est confirmé, le correctif est de les déclarer aussi dans les `dependencies` de `@mimir/api`. Vaut pour tout externe venant d'un autre paquet du workspace.
3. **esbuild et `allowBuilds: false`.** Les scripts d'installation d'esbuild sont désactivés sur ce workspace. Ça fonctionne en local parce qu'esbuild moderne livre ses binaires par dépendances optionnelles et non par script d'installation, mais le binaire Linux du build Vercel reste à confirmer.
4. **La résolution de l'alias `@/` par esbuild.** esbuild lit les `paths` d'un `tsconfig`, mais `apps/api/tsconfig.json` déclare `paths` sans `baseUrl`. Si la résolution échoue, ajouter `baseUrl`.
5. **Les imports en `.js` vers des sources `.ts`.** Le backend est en NodeNext et écrit `@/config/auth.js` pour un fichier `auth.ts`. esbuild doit faire cette correspondance. C'est typiquement ce qui casse en premier.
6. **Les commandes d'installation et de build en monorepo pnpm.** Le comportement exact de `pnpm install` et de `pnpm build` depuis la racine d'un service dans un workspace pnpm demande une itération possible sur les commandes.
7. **La syntaxe `services` elle-même**, du fait de la Beta.

## À vérifier au premier déploiement

Le tableau de validation locale ne couvre que ce qui est observable sur une machine de développement. Les points ci-dessous ne se voient **que** sur Vercel, et chacun est une cause d'échec plausible du premier preview. Les vérifier dans cet ordre, qui suit celui du build puis de la requête.

| # | À vérifier | Comment le constater | Si ça casse |
|---|---|---|---|
| 1 | Le réglage Framework du projet est sur « Services » | Les logs de build montrent 2 builds distincts, `web` et `api`. Un seul build signifie que le `vercel.json` est ignoré | Repasser le réglage, redéployer. C'est un échec silencieux, pas une erreur |
| 2 | esbuild s'installe malgré `allowBuilds: false` | Les logs de build du service `api` passent `pnpm bundle` sans `Cannot find module esbuild` ni erreur de binaire de plateforme | Autoriser `esbuild` dans `allowBuilds` de `pnpm-workspace.yaml`, ou le remplacer par `pnpm dlx esbuild` |
| 3 | `prisma generate` s'exécute dans le build du service `api` | Les logs montrent la sortie de `prisma generate` avant celle d'esbuild | Le `buildCommand` du service ne s'exécute pas depuis la racine du workspace, le `--filter` ne résout rien. Passer par un script de `apps/api` |
| 4 | Le client Prisma généré est présent dans la fonction déployée | Un appel à une route qui touche la base, pas `/api/health`. Une erreur de client non généré au runtime signe l'absence | Le traçage de fichiers de Vercel suit mal les liens symboliques de pnpm. Déclarer le client via `includeFiles`, qui n'est pas un champ de service mais une clé de `functions` scopée au service d'après la référence de configuration |
| 5 | Le runtime Linux n'attend pas de binaire de moteur Prisma | Même appel que le point 4 | `@prisma/adapter-neon` est en pur JavaScript et n'est pas censé réclamer de moteur. Si une erreur de binaire apparaît quand même, ajouter `binaryTargets` dans le `generator` du schéma pour la cible Linux de Vercel |
| 6 | Le rewrite `/api/(.*)` n'est pas avalé par le catch-all SPA | `/api/health` renvoie du JSON, pas le `index.html` du frontend | Les rewrites de premier niveau sont ordonnés : vérifier que la règle `/api/(.*)` précède bien le catch-all |
| 7 | Le cookie de session est posé sur l'hôte du preview, avec `Secure` | Les en-têtes `Set-Cookie` de la réponse de connexion : domaine du preview, `Secure`, `HttpOnly`, `SameSite=Lax` | Un domaine absent ou un `Secure` manquant renvoie à `BETTER_AUTH_URL` : la dérivation depuis `VERCEL_URL` n'a pas eu lieu, donc le point 2 des réglages Vercel (variables système) n'est pas en place |

Les points 4 et 5 sont les 2 plus probables : ce sont ceux que la validation locale ne pouvait structurellement pas couvrir, puisque le `node_modules` local est complet et la machine n'est pas Linux.

## Il n'y a pas de `main` : l'environnement Production suit `dev`

**Prémisse fausse corrigée le 2026-10-18.** Les versions précédentes de cette spec et de DEC-012 parlaient d'un « verrou sur la promotion vers `main` » et d'une « procédure de promotion » distincte de la fusion. Cet objet n'existe pas. Vérifié par l'utilisateur dans Vercel, Settings → Environments, et confirmé par l'API Vercel qui renvoie `productionBranch: dev` : l'environnement **Production suit la branche `dev`**, Preview suit toutes les autres branches, et le dépôt n'a pas de branche `main`.

**Conséquence sur ce ticket.** La fusion de cette PR dans `dev` **est** le premier déploiement de l'API en production. Il n'y a pas d'étape de promotion après : la fusion déclenche le déploiement de production, et le verrou porte donc sur cette fusion-ci.

Même erreur de méthode que pour l'identité des bases Neon : un nom plausible, `main`, a été employé sans être vérifié dans la console du fournisseur, et toute une procédure a été écrite par-dessus. Ici encore, la correction vient de l'utilisateur, pas du dispositif.

### Règle durable : chaque fusion dans `dev` déploie la production

Elle vaut au-delà de MIM-37, et elle est écrite dans la rule `deploiement-production`.

**Avant toute PR qui apporte une nouvelle migration, `pnpm db:deploy` est lancé contre la production AVANT la fusion.** Motif : la production ne migre pas dans son build (DEC-012), donc rien ne migrerait au moment du déploiement, et le code arriverait sur un schéma qu'il ne reconnaît pas.

**Conséquence à accepter : la base est en avance sur le code pendant quelques minutes**, le temps que la PR soit fusionnée et que le déploiement se termine.

- **Migration additive** (nouvelle table, nouvelle colonne nullable, nouvel index) : sans effet. L'ancien code ignore ce qu'il ne connaît pas.
- **Migration destructrice** (colonne supprimée ou renommée, contrainte resserrée, type changé) : l'ancien code continue de lire ou d'écrire ce qui vient de disparaître pendant ces quelques minutes, et il casse. Elle demande un **découpage en 2 temps** : d'abord une migration additive plus un code qui n'utilise plus l'ancienne forme, fusionné et déployé ; puis, dans une seconde PR, la migration qui supprime. Jamais les 2 dans la même fusion.

### Étapes d'après-fusion, dans cet ordre exact

Elles supposent toutes que la configuration `services` est présente sur la branche `dev`, ce qui n'est pas le cas avant la fusion.

| # | Étape | Pourquoi dans cet ordre |
|---|---|---|
| 1 | **La fusion** de cette PR dans `dev` | Elle déclenche le déploiement de production. Les migrations sont déjà appliquées, la production ayant été réinitialisée puis remigrée le 2026-10-18, donc rien à lancer avant |
| 2 | **Laisser Build Command, Output Directory et Install Command tels quels** au niveau du projet | Cette étape disait l'inverse, « les vider », et c'est elle qui a cassé la production le 2026-10-18. Ces 3 champs ne sont pas inertes en mode `services` : ils commandent l'empaquetage de la fonction. Il n'y a rien à faire ici, et il n'y aura jamais rien à y faire |
| 3 | **Vérifier `/api/health` en `200` et `/api/me` sans cookie en `401`** | 2 appels en lecture, **aucun compte créé en production**. Ils suffisent : le premier prouve que l'API est servie et routée, le second qu'elle parle à Better Auth et refuse une requête anonyme |

**Pas d'inscription en production pour tester**, et le `401` de `/api/me` sans cookie suffit pour cette étape : il prouve que la route refuse un anonyme sans écrire une ligne.

**Amendement du 2026-10-19 : cette interdiction était trop large, et elle est reformulée dans la rule `bases-et-identifiants`.** « Pas d'inscription de test en production, sauf une mesure délibérée dont la suppression est exécutée dans la même session et consignée dans le ticket. » Motif : les 11 comptes trouvés dans la base venaient de tests répétés non suivis, pas d'une mesure unique, et la règle interdisait la seule vérification possible de ce qu'elle protège. Ce qu'elle protège reste intact : aucun compte qui survit à la session, aucune inscription de confort, et les sondes en lecture d'abord.

Ce que le `401` ne prouve pas, et qui a motivé l'amendement : le 2026-10-08, avec `BETTER_AUTH_URL` à `x` et la production cassée, `/api/me` sans cookie renvoyait **aussi** un `401`. Une mesure qui donne le même résultat quand tout va bien et quand tout est cassé ne mesure rien.

Hors séquence, sans effet sur la production : créer `VERCEL_AUTOMATION_BYPASS_SECRET` dans Deployment Protection et le déclarer en secret de dépôt GitHub, utile dès maintenant pour que la CI joue les e2e contre un preview protégé.

Audit fait le 2026-10-18 : aucune autre étape de cette spec ne s'applique à une production qui n'est pas encore en mode `services`. Les réglages restants, variables système et Deployment Protection, valent pour les 2 modes.

### Si l'authentification se comporte mal au premier déploiement, regarder là

`BETTER_AUTH_URL` et `FRONTEND_URL` en Production datent du 2026-10-08, sont marquées `sensitive` donc **illisibles pour tout le monde**, et le projet a plusieurs domaines. Ces 2 variables ne peuvent porter qu'**un seul** hôte chacune, alors que la production répond sur plusieurs : si celui qui y est écrit n'est pas celui par lequel tu arrives, l'authentification casse, et elle casse d'une façon particulière.

| Symptôme | Cause la plus probable |
|---|---|
| L'inscription renvoie `200` mais aucune session ne s'ouvre, et aucun cookie n'apparaît dans l'onglet Application du navigateur | `BETTER_AUTH_URL` porte un autre hôte que celui visité : le cookie est posé sur un domaine qui n'est pas le tien, donc le navigateur le jette |
| L'appel échoue avant toute réponse utile, avec une erreur d'origine dans la console du navigateur | `FRONTEND_URL` porte un autre hôte : il alimente `trustedOrigins` et CORS, donc l'origine visitée n'est pas de confiance |
| Tout marche sur un domaine et rien sur un autre | Les 2 variables sont correctes, mais pour un seul des domaines |

**Comment trancher sans pouvoir lire les valeurs.** Elles sont illisibles, donc le diagnostic ne passe pas par leur lecture. 2 voies :

1. **Par l'observation.** La réponse de connexion porte un `Set-Cookie` dont le domaine est écrit en clair : c'est la valeur effective de `BETTER_AUTH_URL`. Et l'en-tête `access-control-allow-origin` de n'importe quelle réponse de l'API révèle la valeur effective de `FRONTEND_URL`. 2 en-têtes, et les 2 variables sont identifiées sans jamais être lues.
2. **Par le remplacement.** Comme pour les `BETTER_AUTH_SECRET`, on n'essaie pas de lire : on écrit par-dessus avec la valeur du domaine canonique, celui par lequel on veut que l'application réponde. Puis on redéploie, une variable n'étant lue qu'au démarrage de la fonction.

**Le domaine canonique à y mettre.** Le seul domaine de projet vérifié est `mimir-navy.vercel.app`, lu par l'API Vercel le 2026-10-18. Les autres hôtes sur lesquels la production répond sont les alias générés par Vercel, de la forme `mimir-<hash>-<équipe>.vercel.app` et `mimir-git-dev-<équipe>.vercel.app`, qui changent ou dépendent de la branche. **Ce sont les 2 variables qui doivent porter le domaine stable, pas un alias**, sinon elles se périment au déploiement suivant.

## Risque consigné, non corrigé dans MIM-37

**Ce risque s'est réalisé le 2026-10-18**, sur `BETTER_AUTH_URL` et non sur les migrations : voir le 3e manque plus haut. Le chemin de production n'était exercé par aucun preview, et c'est exactement par là que la panne est arrivée.

**Version initiale de ce risque, fausse sur l'essentiel** : « tous les previews partagent une seule branche Neon de dev ». La branche partagée n'est pas celle de développement, c'est celle de **production**, et le risque n'est pas « faible aujourd'hui » mais réalisé. Voir le constat en tête de cette spec. Conservé ici pour montrer qu'un risque consigné sur la mauvaise base donne une fausse assurance : il a été écrit, relu et jugé acceptable, alors qu'il décrivait une situation qui n'existait pas.

## 5 manques, en tickets séparés

Les 2 premiers relevés à la relecture du corps de PR, les 2 suivants par les 2 pannes de production du 2026-10-18, le 5e par la tentative de correctif qui a suivi.

**Ordre de priorité : le contrôle `/api/health` dans la CI (4) passe devant le durcissement `.mjs` (5).** C'est le seul des 2 qui aurait attrapé les 2 pannes du 2026-10-18, l'une et l'autre. Le `.mjs` est de la **défense en profondeur**, pas le correctif : il supprime une classe de panne, et il ne rend pas viable le mode sans les 3 champs, ce que la mesure du paquet montre. Un contrôle qui vérifie qu'un déploiement démarre attrape aussi les pannes qu'on n'a pas prévues ; un correctif ciblé n'attrape que celle qu'il vise.

### 1. Les obligations RGPD, à traiter avant la première fonctionnalité d'upload

**C'était une incohérence de ce document.** Plusieurs décisions de sécurité y sont justifiées par « Mímir stocke des documents personnels » (Deployment Protection maintenue, séparation Production/Preview, identifiants de production hors de portée d'un agent), et aucune ligne ne traitait des obligations que ce même fait crée. Le fait est invoqué quand il sert à refuser quelque chose, ignoré quand il oblige à faire quelque chose.

À traiter **avant** la première fonctionnalité d'upload, pas après : les 2 premiers points deviennent des migrations de données une fois que des documents existent, et les 3 suivants sont des engagements à prendre avant de collecter, pas après.

| Sujet | Ce qu'il faut trancher |
|---|---|
| **Région d'hébergement** | **Tranché, pas à vérifier** : il y a transfert hors UE à chaque requête. Détail ci-dessous |
| **Durée de conservation** | Aucune n'est définie. Combien de temps un document, une conversation, un `Memory` sont gardés, et ce qui se passe à l'expiration |
| **Droit à l'effacement** | Il n'existe aucun chemin de suppression de compte. Les clés étrangères en cascade suppriment les lignes liées, mais pas les fichiers du stockage objet ni les vecteurs, et les 2 arrivent avec l'upload |
| **Mention d'information** | Quelles données sont collectées, pourquoi, combien de temps, qui les traite. À écrire avant la collecte |
| **Sous-traitants** | Neon, Vercel, Anthropic, et **le fournisseur d'embeddings**, qui reçoit le contenu des documents. DEC-003 n'est pas tranchée, donc le choix est encore ouvert et le critère de localisation des données peut y entrer |

#### La région : le transfert hors UE est établi, c'est un arbitrage et pas un réglage

**Le code tourne aux États-Unis et lit une base en Europe.** Les logs de build annoncent « Running build in Washington, D.C., USA (East) – iad1 », et l'API Vercel le confirme pour l'exécution et non seulement pour le build : `serverlessFunctionRegion: "iad1"` et `functionDefaultRegions: ["iad1"]`. Les 3 branches Neon sont en `eu-central-1`, lisible dans leurs endpoints. **Chaque requête SQL est donc un transfert de données personnelles hors UE**, et ça ne dépend d'aucune donnée qui n'existerait pas encore : c'est vrai dès le premier compte.

**Conséquence technique, à chiffrer dans le ticket** : environ 90 ms d'aller-retour entre `iad1` et `eu-central-1` **par requête SQL**, et une route qui enchaîne 3 requêtes séquentielles paie 3 fois. C'est le poste de latence dominant de l'application, très au-dessus du temps de calcul.

**Ce n'est pas un réglage, c'est un arbitrage.** Le choix de la région des fonctions n'est pas disponible sur l'offre Hobby : `iad1` y est imposé. 4 options, qui coûtent toutes quelque chose :

| Option | Ce que ça règle | Ce que ça coûte |
|---|---|---|
| 1. Déplacer les branches Neon en `us-east-1` | La latence disparaît, les 2 côtés sont colocalisés | **Change la nature de l'engagement.** Détail ci-dessous. La pire des 4 sur le plan RGPD |
| 2. Offre payante et fonctions en `fra1` | La latence **et** le transfert hors UE disparaissent | Un abonnement |
| 3. Rester en l'état et le documenter | Rien | L'assumer dans la mention d'information, et accepter les 90 ms par requête |
| 4. **Réduire le nombre d'allers-retours** au lieu de leur distance | Une grande partie de la latence, sans abonnement et sans toucher à la localisation | Du travail sur chaque route, et ça ne règle rien du RGPD |

**La nature du coût de l'option 1, qui n'est pas une simple aggravation.** Aujourd'hui les données sont **stockées en UE et traitées aux USA**. Déplacer Neon en `us-east-1` les ferait **stocker ET traiter aux USA**. Ce n'est pas le même engagement à prendre dans la mention d'information : on passe de « vos données sont hébergées en Europe, et traitées aux États-Unis » à « vos données sont hébergées et traitées aux États-Unis ». Pour des utilisateurs français, le stockage en UE est la posture la plus défendable, et c'est justement celle que l'option 1 abandonne. Elle échange un problème de performance contre une régression d'engagement, donc elle est la pire des 4 sur ce plan.

**L'option 4, et pourquoi elle est la première à essayer.** Les 270 ms d'une route à 3 requêtes viennent du nombre d'allers-retours **séquentiels**, pas de la distance seule. Les leviers, par efficacité décroissante :

| Levier | Effet réel |
|---|---|
| **Jointures et `include` au lieu de requêtes séparées** | N allers-retours deviennent 1. C'est le seul levier qui supprime vraiment des trajets |
| **Paralléliser ce qui est indépendant** (`Promise.all`) | N trajets restent N, mais ils se recouvrent : le temps d'attente passe de N × 90 ms à environ 90 ms |
| **Mettre en cache ce qui ne bouge pas** | Supprime le trajet entièrement sur les lectures répétées |
| **Regrouper dans une transaction** | **Ne réduit pas les allers-retours.** À noter, parce que c'est contre-intuitif : une transaction interactive les met sur une seule connexion et les **sérialise**, donc elle garantit l'atomicité sans rien gagner en latence, et elle tient la connexion plus longtemps. À utiliser pour la correction, pas pour la performance |

#### La variante WebSocket amortit-elle quelque chose ? Non, pas le trajet par requête

**Et d'abord une correction : notre code n'utilise pas la variante HTTP, contrairement à ce qui était écrit ici.** `packages/db/index.ts` et `packages/db/audit.ts` instancient `PrismaNeon`, qui est `PrismaNeonAdapterFactory` dans `@prisma/adapter-neon@7.10.0` et construit un `neon.Pool`, donc **le protocole Postgres sur WebSocket**. La variante HTTP est exportée séparément, sous `PrismaNeonHttp`. Vérifié en lisant le code de l'adaptateur installé.

Réponse à la question : **chaque requête paie le trajet dans les 2 variantes.** Aucune ne supprime l'aller-retour vers `eu-central-1`, parce qu'une requête doit y aller et revenir. Ce qui diffère est ailleurs :

| | HTTP (`PrismaNeonHttp`) | WebSocket (`PrismaNeon`, ce qu'on utilise) |
|---|---|---|
| Trajet par requête | 1 | 1 |
| Établissement de connexion | aucun, chaque requête est une requête HTTPS indépendante. La documentation Neon le donne comme « l'option la plus rapide pour des requêtes isolées » | plusieurs allers-retours une fois, TCP, TLS, bascule WebSocket et authentification Postgres, **puis amorti sur toutes les requêtes suivantes de la même instance** |
| Transactions | **refusées**, l'adaptateur lève « Transactions are not supported in HTTP mode » | supportées, y compris interactives |

**Donc ce que le WebSocket amortit, c'est le coût de connexion, pas le coût de distance.** Et il l'amortit d'autant mieux que Fluid Compute réutilise les instances de fonction entre les requêtes : la connexion survit à la requête HTTP et sert les suivantes. C'est un argument pour garder cette variante, pas pour en espérer un gain sur les 90 ms.

Un détail à garder en tête si l'option 4 est explorée : la variante HTTP de Neon sait envoyer **un tableau d'instructions en une seule requête** (`sql.transaction([...])`, non interactif), ce qui collapserait vraiment N trajets en 1. Mais l'adaptateur Prisma en mode HTTP refuse les transactions, donc cette capacité n'est pas accessible depuis Prisma aujourd'hui. Ne pas compter dessus sans l'avoir vérifié sur la version du moment.

**À trancher avant le premier upload**, parce qu'un déplacement de base est bien plus simple avant que des documents existent, et parce que la mention d'information doit dire la vérité sur la localisation au moment où la collecte commence.

### 2. La règle de migration n'a aucune application : un contrôle au démarrage manque

La rule `deploiement-production` dit que `pnpm db:deploy` part contre la production **avant** la fusion. **Rien ne l'applique.** Si l'étape est oubliée, le code arrive sur une base en retard et sert des `500` sur la première requête qui touche une table ou une colonne manquante, sans que rien n'ait signalé la cause. La règle ne repose aujourd'hui que sur la discipline de l'utilisateur, et une règle sans filet finit par être oubliée exactement le jour où elle compte.

Le filet manquant, dans l'esprit de l'échec bruyant appliqué partout ailleurs dans ce ticket (`env.ts` qui refuse un repli silencieux, `cliDatasource` qui lève plutôt que de passer par le pooler, `strictPort` qui refuse de glisser sur un autre port) : **un contrôle au démarrage de l'API qui compare les migrations enregistrées en base à celles du dossier `prisma/migrations`, et qui refuse de servir si la base est en retard.**

Points à traiter dans le ticket, parce qu'ils décident si le filet est utilisable :

- **Ce qu'il lit** : les `migration_name` de `_prisma_migrations` contre les noms de dossiers de `prisma/migrations`. Une migration enregistrée mais non terminée (`finished_at` vide) compte comme absente, c'est exactement l'état qui bloquait les builds dans ce ticket.
- **Base en avance, et c'est le cas normal** : la règle fait partir les migrations avant la fusion, donc la base a légitimement des migrations que le code ne connaît pas encore pendant quelques minutes. Le contrôle doit **refuser le retard et tolérer l'avance**, sinon il casse le déroulé qu'il est censé protéger.
- **Le coût au démarrage** : 1 requête, sur une fonction qui démarre à froid. À mesurer, et à ne pas mettre sur le chemin de chaque requête.
- **Ce que `/api/health` renvoie dans cet état** : vraisemblablement un `503` qui nomme les migrations manquantes, pour que la cause se lise dans la réponse au lieu de se déduire des logs.

### 3. `env.ts` vérifie la présence des variables, pas leur forme

**Panne réelle, production cassée le 2026-10-18 après la fusion.** `BETTER_AUTH_URL` en Production valait la chaîne d'un caractère `x`, posée le 8 octobre et jamais relue. `/api/health` et `/api/me` renvoyaient tous les deux `500 FUNCTION_INVOCATION_FAILED`, et la trace réelle était :

```
[BetterAuthError: Invalid base URL: x. Please provide a valid base URL.]
  [cause]: TypeError: Invalid URL
    at assertHasProtocol (better-auth/dist/utils/url.mjs:35:21)
    at getBaseURL (better-auth/dist/utils/url.mjs:69:18)
    at init (better-auth/dist/context/init.mjs:10:20)
  code: 'ERR_INVALID_URL', input: 'x'
Node.js process exited with exit status: 1.
```

**Le trou.** `resolveUrl` dans `apps/api/src/config/env/env.ts` teste `if (value)`, donc la **présence**. Une chaîne non vide passe, quelle qu'elle soit. La valeur a traversé `env.ts` sans un mot, puis Better Auth a levé 3 couches plus loin, à l'initialisation du module et non sur une route : c'est pourquoi `/api/health`, qui ne touche ni la base ni l'authentification, tombait exactement comme `/api/me`.

C'est une incohérence avec le reste du dispositif, qui refuse partout le passage silencieux : `env.ts` lui-même interdit le repli en production, `cliDatasource` lève plutôt que d'emprunter le pooler, `strictPort` refuse de glisser sur un autre port. La vérification de forme manquait au seul endroit où la valeur vient d'un collage à la main.

**Le ticket.** Les variables qui sont des URL doivent se **parser comme une URL avec un protocole**, sinon `env.ts` lève, avec le nom de la variable et la valeur reçue. Le message aurait été `BETTER_AUTH_URL n'est pas une URL valide : "x"`, et le diagnostic aurait pris 10 secondes au lieu d'un aller-retour de logs d'exécution.

- Concerne `FRONTEND_URL` et `BETTER_AUTH_URL`, et l'URL dérivée de `VERCEL_URL` en preview par la même occasion.
- La valeur reçue figure dans le message : c'est un hôte, pas un secret. Ne pas étendre ce principe aux variables sensibles, où un message ne doit jamais contenir la valeur.
- Lever **au chargement du module**, comme aujourd'hui, et non à la première requête : une fonction qui refuse de démarrer est plus lisible qu'une fonction qui sert des `500`.
- Les tests de `env.test.ts` couvrent la présence ; à compléter par les cas de forme, en premier (rule `tests-tdd`).

**Le risque consigné s'est réalisé, exactement comme écrit.** Ce document notait que le défaut du découpage des migrations était que « le chemin de production n'est exercé par aucun preview ». La panne est précisément celle-là, sur une autre variable : en preview, `BETTER_AUTH_URL` est **dérivée de `VERCEL_URL`**, donc la valeur de production n'a jamais été exercée par un seul déploiement, et les 5 e2e verts ne pouvaient structurellement pas la voir. Un risque écrit, relu et jugé acceptable s'est produit au premier déploiement réel. L'enseignement n'est pas qu'il fallait le corriger plus tôt, c'est que **la dérivation en preview protège du besoin de configurer, et masque du même coup ce qui est mal configuré ailleurs** : tout ce qui est dérivé en preview est, par construction, non testé en production.

### 4. Rien dans la CI ne vérifie qu'un déploiement DÉMARRE, et c'est le plus prioritaire des 4

Les 2 pannes du 2026-10-18 ont passé la CI au vert. Les contrôles portent sur le lint, les types et les tests, c'est-à-dire sur le code **avant** qu'il soit empaqueté et lancé. Le preview de la PR #60 était `Ready` alors que sa fonction ne bootait pas : `Ready` décrit la fin du build, pas un processus qui répond.

**Le ticket.** Un appel à `/api/health` sur le preview, dans la CI, attendant un `200`. Ce seul appel aurait attrapé les 2 pannes du jour : celle de `BETTER_AUTH_URL`, qui lève au chargement du module, et celle de l'empaquetage, qui échoue avant la première ligne de notre code.

- Il faut l'URL du preview, que l'action de déploiement Vercel expose, et le contournement de Deployment Protection, donc `VERCEL_AUTOMATION_BYPASS_SECRET` en secret de dépôt. C'est la même dépendance que les e2e en CI, déjà listée hors séquence.
- `/api/health` suffit, et c'est pour ça qu'il existe : il ne touche ni la base ni l'authentification, donc un `200` prouve que le processus démarre et que la route est servie, sans rien écrire.
- Un `401` attendu sur `/api/me` sans cookie complète à un coût nul.
- La leçon derrière le ticket : nos contrôles vérifiaient que le code est correct, aucun ne vérifiait qu'il **tourne**.

### 5. MIM-103 : rendre le format du bundle indépendant de l'empaquetage, en `.mjs`

Tentée et révertée le 2026-10-18, section « La tentative `.mjs` » plus bas pour le détail. L'extension `.mjs` supprime la dépendance au `package.json` le plus proche, mais elle change aussi le traçage des dépendances par Vercel : `cors` disparaît du paquet alors qu'il est déclaré dans les `dependencies` de `@mimir/api`, et `/api/health` du preview répond `500` sur `Cannot find module 'cors'`.

- **Première étape du ticket** : la mesure qui manquait, le **contenu** du paquet produit en local avec et sans l'extension `.mjs`, et non son seul `handler`. Elle dira quelle partie du traçage l'extension déplace.
- C'est un **durcissement facultatif** : la production tourne sans, et le ticket 4 le précède.
- Le `.mjs` ne rend pas viable le mode sans les 3 champs de build. Il ne remplace donc rien.

## La deuxième panne : les 3 champs de build ne sont pas inertes

### Ce que cette panne laisse derrière elle : une dépendance fragile

**La production dépend maintenant d'un comportement de Vercel non documenté et contre-intuitif** : un champ dont la **valeur est ignorée**, mais dont la **présence décide de l'empaquetage** de la fonction. Rien dans le tableau de bord ne le dit, rien dans les logs de build ne le montre, et le mot « Override » suggère l'inverse de ce qui se passe.

Conséquence à garder en tête : **quelqu'un qui range ce tableau de bord dans 6 mois casse la production en silence, avec un build vert.** C'est exactement ce qui est arrivé le 2026-10-18, en suivant une étape que cette spec prescrivait.

**Le piège précis, mesuré :** toute valeur d'Output Directory donne le bon paquet, y compris un dossier qui n'existe pas, **sauf une seule, la chaîne `dist`**, qui est la valeur par défaut. Un futur « nettoyage » qui remettrait la valeur par défaut, en croyant revenir à un état neutre, casserait donc tout aussi sûrement qu'un champ vidé. Il n'y a pas de valeur neutre : il y a un remplacement, ou la panne.

Après la fusion de la PR #60 (18 montées de dépendances), `/api/health` et `/api/me` sont repassés en `500`. 2 changements étaient partis ensemble : les dépendances, et le **vidage des 3 champs de build du projet**, fait juste avant parce que cette spec le prescrivait. Erreur d'exécution brute :

```
(node:8) Warning: Failed to load the ES module: /var/task/index.js.
Make sure to set "type": "module" in the nearest package.json file or use the .mjs extension.
/var/task/index.js:2
import cors from "cors";
^^^^^^
SyntaxError: Cannot use import statement outside a module
    at wrapSafe (node:internal/modules/cjs/loader:1861:18)
Node.js process exited with exit status: 1.
```

### Le tri a d'abord été fait sur la mauvaise source

La première analyse a comparé les **logs de build** des 2 déploiements, n'y a vu aucune différence de comportement, et en a conclu que les 3 champs étaient bien inertes et que les dépendances étaient coupables. **La conclusion était fausse, et la méthode aussi** : l'erreur portait sur l'**empaquetage** de la fonction, que les logs de build ne décrivent à aucun moment. Mesure faite depuis : avec et sans les 3 champs, en local, les logs de build sont identiques au mot près, jusqu'aux 2 dernières lignes.

**Enseignement de méthode, général :** une preuve d'absence tirée d'une source qui ne couvre pas le phénomène n'est pas une preuve. Avant d'écrire « rien n'a changé », vérifier que la source consultée **pourrait** montrer le changement cherché. Ici l'indice était dans l'analyse elle-même, qui nommait l'empaquetage comme le siège du problème tout en concluant depuis une source qui ne le montre pas.

### Ce que la mesure établit

L'expérience décisive a été faite côté production : les 3 champs réactivés, le **même commit** `b6717b5` redéployé sans cache, `/api/health` en `200`.

| Mesure | Déploiement cassé | Déploiement sain |
|---|---|---|
| Commit | `b6717b5` | `b6717b5`, le même |
| `projectSettings` enregistrés sur le déploiement | `buildCommand`, `installCommand`, `outputDirectory` à `null` | les 3 renseignés |
| Taille du paquet de fonction | 3 822 745 octets | 3 824 542 octets |
| Logs de build | identiques | identiques |

Même commit, même lockfile, même code : **les dépendances de la PR #60 sont innocentes**, et les 3 champs sont causaux.

### Pourquoi, mesuré et non déduit

Le mécanisme a été reproduit en local avec `vercel build` (CLI 64.5.0, le CLI installé en 53.2.0 ne connaît pas encore `services`), en écrivant les réglages à la main dans `.vercel/project.json` pour garder le contrôle de la comparaison, et sans aucun `vercel pull`, qui aurait écrit des variables de Preview sur le disque.

| Réglages de projet | `handler` du paquet | Contenu du paquet |
|---|---|---|
| Les 3 renseignés | `apps/api/vercel.entry.mjs` | `apps/api/package.json`, le bundle, `node_modules` tracé, des shims `_virtual/` |
| Aucun | `index.js` | aucun `package.json` |
| Install Command seule | `index.js` | aucun `package.json` |
| Build Command seule | `index.js` | aucun `package.json` |
| Output Directory seule | `apps/api/vercel.entry.mjs` | paquet complet |

**Le champ qui porte l'effet est l'Output Directory, pas l'Install Command.** L'hypothèse de départ, « l'Install Command gouverne l'installation à la racine », a donc été testée et elle est fausse : seule l'Install Command renseignée, le paquet reste cassé.

Détail qui dit la nature du mécanisme : `outputDirectory` vaut `apps/web/dist` chez nous, et n'importe quelle autre valeur donne le bon paquet, y compris un dossier qui n'existe pas. **Une seule valeur se comporte comme un champ vide : la chaîne `dist`**, qui est la valeur par défaut. Le constructeur ne réagit donc pas à la valeur ni à son existence sur le disque, mais au fait qu'un **remplacement explicite** est posé : `dist` est lu comme « pas de remplacement ».

Enchaînement complet, de la cause à l'erreur : pas de remplacement d'Output Directory → le constructeur prend l'autre chemin d'empaquetage → le handler devient `index.js` à la racine du paquet, sans `package.json` à côté → Node décide du format d'après le `package.json` le plus proche, n'en trouve aucun, retombe sur CommonJS → le bundle ESM lève `SyntaxError: Cannot use import statement outside a module`. Le `"type": "module"` de `apps/api/package.json` est bien là, mais il n'est plus dans le paquet, donc il ne s'applique plus.

Ce que la reproduction locale ne couvre pas, et qui reste dit : dans le paquet cassé produit en local, il n'y a **aucun** fichier à part `.vc-config.json`, alors que le paquet cassé en production contenait bien un `index.js` avec notre bundle. La bascule du handler est reproduite, le contenu exact du paquet ne l'est pas, probablement une différence de version entre le constructeur local et celui du cloud. La chaîne causale tient sur la mesure de production ; la reproduction locale ne sert qu'à désigner le champ.

### La tentative `.mjs` : écrite, déployée sur un preview, révertée le même soir

**Intention.** Un fichier `.mjs` est ESM **par son extension**, donc son format ne dépend d'aucun `package.json` ni de ce que le paquet contient. Les 3 champs restent nécessaires de toute façon, mais cette classe de panne cesserait de dépendre de 3 réglages de tableau de bord. 4 fichiers changeaient : `outfile` de `esbuild.config.mjs`, la passerelle renommée, l'`entrypoint` de `vercel.json`, le script `start`.

**Résultat : `/api/health` du preview répond `500`, et l'erreur a changé de nature.**

```
Cannot find module 'cors'
Require stack:
- /var/task/apps/api/package.json
Did you forget to add it to "dependencies" in `package.json`?
Node.js process exited with exit status: 1.
```

**Ce que la tentative apprend, et c'est sa vraie valeur : changer l'extension de l'entrypoint change la façon dont Vercel trace les dépendances.** `cors` est déclaré dans les `dependencies` de `@mimir/api`, et il était bien dans le paquet avant ce changement : la mesure du paquet sain, plus haut, montre un shim `_virtual/_cjs-shim_apps_api_cors.mjs` et un `node_modules` tracé. Avec l'entrypoint en `.mjs`, le module disparaît du paquet. L'empaquetage est par ailleurs de la bonne forme, le chemin de la pile étant `/var/task/apps/api/...` et non un `index.js` à la racine : ce n'est donc pas un retour de la panne du soir, c'est une panne nouvelle.

**Décision du 2026-10-18 au soir : la tentative est révertée** (`git revert`, pas de réécriture d'historique, pour que la trace reste lisible). Motifs : la production tourne sans, c'est un durcissement facultatif et non un correctif, et le contrôle `/api/health` en CI le précède en priorité. Le ticket reste ouvert avec ce point de départ, et sa première étape est la mesure locale du contenu du paquet, qui n'avait pas été faite.

**Erreur de méthode à l'origine de cette perte de temps.** La mesure annoncée comme validant le correctif portait sur le **`handler`** du paquet, pas sur son **contenu**. Un handler correct ne dit rien des modules présents à côté. C'est la même erreur que la comparaison des logs de build pour une panne d'empaquetage, à 24 heures d'écart. Formulée une fois pour toutes dans la rule `deploiement-production` : une vérification porte sur la chose elle-même, pas sur un indicateur corrélé.

## Séquence de validation sur le preview

1. `/api/health` répond.
2. L'inscription sur `/signup` aboutit.
3. La connexion aboutit.
4. Le cookie de session est bien posé sur le domaine du preview.
5. `/api/me` renvoie l'utilisateur avec ce cookie.

## Résultat du premier déploiement

Le premier preview a échoué en 2 secondes, avant tout build :

```
Error: [ENTRYPOINT_NOT_FOUND] Service "api" has entrypoint "dist/index.js" but that path does not exist.
```

**Ce que ça apprend.** Vercel résout l'`entrypoint` d'un service **avant** le build, contre le contenu du dépôt. Or `dist/index.js` est un artefact produit par le build. Ce n'est pas un mauvais chemin, c'est une poule et un œuf, et aucun réglage de chemin ne le résout. L'erreur apprend aussi que le mode `services` était bien actif : elle n'aurait pas pu nommer le service `api`.

**La passerelle.** `apps/api/vercel.entry.js`, versionné, 1 ligne utile qui importe `./dist/index.js`. Le fichier existe dans le dépôt, donc la validation passe ; l'import n'est résolu qu'à l'exécution, quand `dist` existe. Le traçage de fichiers de Vercel a suivi l'import : la fonction déployée contient bien le bundle.

**La séquence de validation, protection active**, via `vercel curl --deployment` :

| Étape | Résultat |
|---|---|
| `/api/health` | `200`, `{"status":"ok","service":"mimir-api"}` |
| Inscription | `200`, utilisateur créé en base |
| Cookie de session | `__Secure-better-auth.session_token`, domaine du preview, `Secure`, `HttpOnly`, `SameSite=Lax` |
| Connexion | `200` |
| `/api/me` avec cookie | `200`. Sans cookie : `401`. Route `/api` inconnue : `404`. `/` : `200 text/html` |

Les 7 points de la section précédente sont levés, dont les 2 jugés les plus probables : le client Prisma est tracé dans la fonction déployée, et aucun binaire de moteur n'est réclamé. L'en-tête `access-control-allow-origin` renvoyant l'hôte du preview confirme que `frontendUrl` a bien été dérivée de `VERCEL_URL`. Le plan B n'a pas servi.

La suite e2e Playwright passe 5 tests sur 5 contre ce preview protégé, en mode `PREVIEW_URL`.

**Ce que ces 5 verts valident, et ce qu'ils ne valident pas.** En mode preview, `skipsDatabaseAssertions` de `e2e/helpers.ts` désactive les assertions qui interrogent la base avec Prisma, parce que le runner lit `.env.test` alors que le déploiement écrit sur sa propre branche Neon : le test chercherait l'utilisateur dans la mauvaise base et trouverait `null`. Ces 5 verts valident donc **le comportement visible dans le navigateur et les réponses de l'API**, inscription, connexion, cookie de session, `/api/me`, et **pas l'état de la base**. La couverture de la base est assurée par les mêmes tests lancés en local contre `.env.test`, où toutes les assertions sont actives. Les assertions de navigateur, elles, ne sont jamais désactivées : aucun test ne devient creux, chacun perd une vérification nommée.

## Cartographie des bases Neon

Établie par expérience, pas par lecture de configuration, après une contradiction dans mes propres comptes rendus sur l'identité des branches.

| Qui | Variable lue | Branche Neon | Rôle réel |
|---|---|---|---|
| Développement local (`pnpm dev:api`, `pnpm db:*`) | `.env` du dépôt | branche A | base de développement |
| Suite e2e locale et `globalSetup` | `.env.test` du dépôt | branche B | base de test, réinitialisée à chaque run |
| Déploiements de preview | `DATABASE_URL` de l'environnement Preview sur Vercel | branche C jusqu'au 2026-10-18, branche D depuis | **base de production**, puis base de preview |
| Production | `DATABASE_URL` de l'environnement Production sur Vercel | branche C | base de production |

Aucun endpoint de production n'existe dans les fichiers locaux du dépôt, `.env` et `.env.test` ne portant que les branches A et B. La branche D, créée le 2026-10-18 comme enfant de la production réinitialisée, n'y figure pas non plus : ses identifiants vivent uniquement dans les variables Preview de Vercel.

**La méthode, et sa limite.** Un compte témoin a été créé par l'API d'un preview, puis cherché dans les 2 bases locales. Il n'est **ni** dans la branche A **ni** dans la branche B : les previews écrivent donc sur une 3e branche, distincte des 2 bases locales. Ça établissait une seule chose, que `.env` local ne pointe pas la base de production. Ça n'établissait **pas** ce qu'était la branche C, et c'est pourtant ce qui a été écrit ici : « base de preview », d'après le nom de la variable Vercel qui la désigne. L'identité réelle a été lue dans la console Neon par l'utilisateur, et c'est la production. Une case laissée « inconnue » dans un tableau n'est pas un trou neutre : tant qu'elle l'est, aucune ligne du tableau ne peut être présentée comme établie.

L'endpoint de la branche C a été révélé par les logs du premier build qui lance `migrate deploy`, et il n'a **pas** de suffixe `-pooler`, ce qui confirme au passage que la `DIRECT_URL` lue en preview est bien une connexion directe. Elle pointe la production. Les endpoints eux-mêmes ne sont pas écrits ici : ce dépôt est public, et un endpoint est la moitié d'une chaîne de connexion. Les 3 noms réels se lisent dans la console Neon, ou dans `.env` et `.env.test`, qui ne sont pas suivis par git.

**Pourquoi la dernière case reste inconnue.** Les variables de Vercel sont marquées comme sensibles : `vercel env pull` les rapporte vides et `vercel env ls` affiche `Encrypted`. `vercel env run` semble les lire, mais il charge le `.env` local par-dessus, donc il renvoie la valeur locale : la méthode est inutilisable pour ce contrôle, et c'est ce qui a produit ma confusion initiale. Pour fermer le tableau, il faut lire la liste des branches et leurs endpoints dans la console Neon, et la rapprocher des bases bindées côté Vercel.

**Conséquence immédiate.** Les comptes de test créés par les exécutions contre un preview, dont le témoin `mapping-1792269908@mimir.test` et un `preview-...@example.com`, vivent sur la **branche de production**. Ils n'ont donc **pas** été supprimés par le nettoyage, qui visait la branche A. Leur suppression se fait depuis la console Neon, et seulement après que les previews aient été basculés sur leur propre branche, pour ne pas en recréer aussitôt.

## Métadonnées des variables Vercel

Relevées le 2026-10-18 par l'API Vercel, le CLI n'exposant ni le marquage de sensibilité ni la limitation à une branche git.

| Variable | Portée | Type | Branche git | Créée le |
|---|---|---|---|---|
| `DATABASE_URL` | preview | sensitive | aucune | 2026-10-16 15:55 |
| `DIRECT_URL` | preview | sensitive | aucune | 2026-10-16 15:58 |
| `BETTER_AUTH_SECRET` | preview | sensitive | aucune | 2026-10-16 15:59 |
| `DATABASE_URL` | production | sensitive | aucune | 2026-10-08 16:53 |
| `DIRECT_URL` | production | sensitive | aucune | 2026-10-08 16:53 |
| `BETTER_AUTH_SECRET` | production | sensitive | aucune | 2026-10-08 16:58 |
| `FRONTEND_URL` | production | sensitive | aucune | 2026-10-08 17:11 |
| `BETTER_AUTH_URL` | production | sensitive | aucune | 2026-10-08 17:32 |

3 constats. **Il n'existe que ces 8 variables** : le geste de copie du 2026-10-16 n'a touché que les 3 entrées Preview, et aucune autre variable n'a été créée par mégarde. **Aucune n'est limitée à une branche git**, donc la portée affichée est la portée réelle. Et **les 8 sont de type `sensitive`**.

**Ce que « sensitive » implique, et qui a induit en erreur hier soir.** Vercel masque définitivement la valeur d'une variable sensible après enregistrement : elle est illisible pour le propriétaire du projet comme pour un outil, dans le tableau de bord comme par l'API. C'est pourquoi `vercel env pull` rapporte `DATABASE_URL=""` au lieu d'échouer, et pourquoi la cartographie des bases ne pouvait pas être établie par là. Sur ces variables, personne ne lit les valeurs, seulement les métadonnées : la seule source d'identité d'une base est la console du fournisseur.

## Migrations

Le découpage et ses motifs sont dans DEC-012. Côté code :

| Environnement | Chemin |
|---|---|
| Preview | `prisma migrate deploy` dans le `buildCommand` du service `api`, derrière `[ "$VERCEL_ENV" = "preview" ]` |
| Production | `DIRECT_URL="..." pnpm db:deploy`, lancé à la main par l'utilisateur |
| Local | `pnpm db:deploy .env` ou `.env.test` |

`scripts/db-deploy.sh` accepte **2 formes et pas une de plus** : un chemin de fichier d'environnement en argument, ou les variables déjà présentes dans le shell. Sans l'une des 2, il refuse de démarrer. La production n'est donc pas un mode à part, c'est le même chemin de code avec une source d'identifiants différente, ce qui évite d'annoncer un chemin de production que rien n'exercerait. **`DIRECT_URL` seule suffit** pour `db:deploy`, `cliDatasource` posant l'URL du CLI sur `DIRECT_URL` pour toute commande de migration : `DATABASE_URL` n'est jamais lue sur ce chemin.

**Pourquoi le fichier est fourni à la main.** La première version récupérait les variables de production depuis Vercel. Vérifié : ça ne marche pas. Les variables du projet sont marquées sensibles, donc `vercel env pull` les rapporte **vides** (`DATABASE_URL=""`), et `vercel env run` charge le `.env` local par-dessus, au point de renvoyer la même valeur pour Preview et pour Production. La promesse a été retirée plutôt que laissée en l'état. Les identifiants viennent de la console Neon et sont passés **en variables de shell pour une seule commande**, jamais écrits sur le disque : un fichier d'identifiants reste lisible par n'importe quel processus de la machine tant qu'il existe, y compris par un shell d'agent, alors qu'une variable passée devant la commande ne survit pas à cette commande.

### Procédure de déploiement en production

Dans cet ordre, et pas un autre :

1. **Migrer** : `DIRECT_URL="..." pnpm db:deploy`, la variable passée pour cette seule commande. Les migrations partent sur la connexion directe, pas sur le pooler.
2. **Vérifier** : la sortie liste les migrations appliquées. En cas de doute, rejouer la commande, qui est idempotente et répond « No pending migrations to apply ».
3. **Fusionner** la PR dans `dev`, ce qui déclenche le déploiement de production.

Le code part donc toujours sur un schéma déjà migré. Il n'y a pas de 4e étape : l'environnement Production suit `dev`, donc aucune promotion ne vient après la fusion (rule `deploiement-production`).

### Résultat de l'exercice de la commande de production

La commande a été lancée contre la branche Neon jetable (`.env.test`), avec 2 vérifications :

| Vérification | Résultat |
|---|---|
| Connexion directe réellement empruntée | `Datasource "db"` annonce le host de la branche B **sans** suffixe `-pooler` |
| Le garde-fou `DIRECT_URL` sert | Avec un `DIRECT_URL` pointant un host inexistant, la commande échoue en `P1000` au lieu de retomber sur le pooler |
| Migrations appliquées | 2 migrations trouvées, « No pending migrations to apply » sur une base déjà à jour |

| Application sur une base vide | Schéma vidé, puis `pnpm db:deploy .env.test` : `Applying migration 20261003060106_init`, `Applying migration 20261007183613_add_better_auth_tables`, tables recréées et interrogeables |
| Idempotence | Relancée aussitôt : « No pending migrations to apply » |

**Le garde-fou traverse les 2 chemins, et le défaut est inversé.** La première version reposait sur une liste de commandes de migration, donc sur une liste qui se périme : une commande future touchant au schéma serait passée par `DATABASE_URL` sans que personne y pense. Le défaut est maintenant l'exigence de la connexion directe, et seul `generate` est explicitement autorisé sur la connexion poolée, parce qu'il ne se connecte à rien.

**Les listes blanches sont déclarées par l'environnement, pas par le code.** `PRISMA_PUSH_ALLOWED_HOSTS` et `PRISMA_RESET_ALLOWED_HOSTS` portent des préfixes de host, dans les fichiers d'environnement non suivis par git : ce dépôt est public, et un endpoint est la moitié d'une chaîne de connexion. **Liste absente vaut refus**, ce qui protège la production par construction, son environnement n'ayant aucune raison de porter ces variables. `.env.example` les documente avec des valeurs factices.

**`migrate reset` est restreint aux bases jetables.** C'est la seule commande vraiment destructive, et elle n'avait aucune restriction : avec le mauvais fichier d'environnement, une faute de frappe suffisait. Sa liste blanche contient le développement local, le test et le preview, et **pas la production**. Elle est plus large que celle de `db push`, qui exclut le preview : `db push` y créerait une divergence de plus, alors que le reset y est précisément le moyen de rendre l'historique vrai. Limite assumée : `prisma db execute` exécute du SQL arbitraire et ne peut pas être restreint de cette façon.

**`db push` est restreint par base.** C'est la cause racine de la divergence : appliqué sur une base partagée, il modifie le schéma sans rien inscrire dans `_prisma_migrations`. Le contrôle ne porte donc pas seulement sur la connexion empruntée mais sur la **cible** : `db push` n'est accepté que sur la base de développement local et sur celle de test, nommées par leur endpoint, et lève sur toute autre. `CLAUDE.md` le dit aussi en clair, puisque `pnpm db:push` y est documenté.

**Détail historique.** Il vivait d'abord dans `scripts/db-deploy.sh`, donc uniquement sur le chemin de production, alors que le `buildCommand` de preview appelle `prisma migrate deploy` directement. Et la première version de `prisma.config.ts` repliait sur `DATABASE_URL` quand `DIRECT_URL` manquait, ce qui réintroduisait le repli silencieux interdit dans `env.ts`. Le contrôle est maintenant dans `packages/db/cliDatasource/`, que `prisma.config.ts` traverse quel que soit le chemin : une commande de migration sans `DIRECT_URL`, ou avec une `DIRECT_URL` poolée, **lève**. `prisma generate` continue de fonctionner sans aucune variable, ce dont la CI dépend. 6 tests couvrent ces cas.

**Les 5 e2e seront rejoués après la réinitialisation du preview, et ce n'est pas une formalité.** Les 5 verts obtenus avant tournaient contre une base construite par `db push`, donc contre un schéma que personne n'a comparé à ce que produisent les migrations. C'est exactement la différence qui justifie la réinitialisation : après elle, la suite s'exécutera contre un schéma issu des migrations, celui que la production aura. Les 2 exécutions ne prouvent donc pas la même chose, et seule la seconde valide le dispositif.

**Note sur les e2e déjà verts.** Les 5 tests passés contre le preview ont tourné **sans** réinitialisation de base, puisque `globalSetup` n'y touche pas en mode preview, et qu'en local il échouait de toute façon sur `--skip-generate`. Les conditions n'étaient donc pas celles prévues par la conception de la suite. Sans conséquence ici, les specs créant un email neuf à chaque run, mais c'est écrit pour que personne ne lise ces 5 verts comme une validation du chemin local.

### Les bases existantes ne sont pas alignées sur l'historique des migrations

Le premier build de preview qui lance `migrate deploy` a échoué :

```
Applying migration `20261007183613_add_better_auth_tables`
Error: P3018
Database error code: 42701
ERROR: column "emailVerified" of relation "User" already exists
```

**Diagnostic.** La branche de preview a été construite par `prisma db push`, qui applique le schéma sans rien inscrire dans `_prisma_migrations`. Les tables et les colonnes existent donc, mais l'historique ne les connaît pas : `migrate deploy` rejoue la migration 2, qui recrée une colonne déjà là. L'échec est enregistré, donc tout `migrate deploy` suivant sur cette base est bloqué jusqu'à résolution.

**Portée.** Ce n'est pas un défaut du chemin de migration, qui a fait exactement son travail : il a trouvé 2 migrations, en a appliqué 1 et s'est arrêté net sur l'incohérence. C'est l'état des bases créées avant que les migrations existent. La base de production a probablement été créée de la même façon, donc le premier `pnpm db:deploy` contre elle échouera de la même manière si rien n'est fait. Confirmé, et c'est ce qui a conduit à la réinitialisation plus bas.

**Décision pour la base de preview : réinitialisation, pas baselining.** `migrate resolve --applied` est une **affirmation non vérifiée** : il déclare la migration appliquée sans comparer quoi que ce soit. Or la base vient de `db push`, dont le résultat peut différer de ce que produisent les migrations sur les index, les contraintes, les valeurs par défaut ou l'ordre des énumérations. La réinitialisation rend l'historique vrai au lieu de le déclarer. Et un preview qui tourne sur une base rafistolée ne teste plus ce que la production fera, ce qui annule l'intérêt du dispositif. Le coût est nul : cette base ne contient que des comptes de test, dont ceux que le nettoyage n'a pas pu atteindre.

**Pour la production, la dérive se mesure avant de décider.** Baseliner sans comparer serait un pari : si le schéma de production ne correspond pas aux migrations, la déclaration pose une bombe à retardement que la migration suivante déclenchera. L'ordre est donc : mesurer la dérive, compter les lignes réelles, puis décider.

Les 2 mesures sont en lecture seule et sont lancées **par l'utilisateur**, qui en transmet la sortie : un agent n'a pas d'identifiants de production (rule `bases-et-identifiants`).

Les variables sont passées dans le shell, pour une seule commande, et ne touchent jamais le disque : un fichier d'identifiants reste lisible tant qu'il existe (rule `bases-et-identifiants`). Pour la production, les mesures se font depuis la console du fournisseur, l'agent n'ayant pas d'identifiants.

**Lister les tables avant de les compter.** La base de production vient d'un `db push` à un état de schéma inconnu, et sa migration 2 a échoué : une requête de comptage qui nomme les 11 tables attendues échoue **en entier** si une seule manque, et rend une erreur au lieu d'une mesure. L'ordre est donc : lister ce qui existe, puis compter. Même motif que tout le reste de ce ticket, ne rien supposer sur l'état d'une base.

```bash
# 1. la derive entre le schema reel et ce que produisent les migrations
cd packages/db
DATABASE_URL="..." DIRECT_URL="..." pnpm exec prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema.prisma

# 2. le volume reel et l'etat de l'historique des migrations
cd ../..
DATABASE_URL="..." DIRECT_URL="..." pnpm db:audit
```

**Les noms d'options ont changé sur Prisma 7**, et la version naïve de ces commandes n'existe plus : `--to-schema-datamodel` est devenu `--to-schema`, et `--from-url` a disparu au profit de `--from-config-datasource`, qui lit la base par `prisma.config.ts`, donc par `DIRECT_URL`. Vérifié en lisant l'aide de la commande installée, après l'avoir vue échouer.

### La mesure de production est rigoureuse, parce que l'historique et le schéma sont d'accord

`migrate diff --from-config-datasource --to-schema` compare la production au **fichier de schéma**, alors que la décision de baselining porte sur l'**historique des migrations**. Les 2 ne coïncident que si `schema.prisma` et `prisma/migrations` sont d'accord entre eux, ce que rien ne garantit : c'est précisément leur désaccord qui produit un P3018. Vérifié cette nuit sur une base jetable, sans toucher à la production :

```bash
SHADOW_DATABASE_URL="<base jetable>" pnpm exec prisma migrate diff \
  --from-migrations ./prisma/migrations \
  --to-schema prisma/schema.prisma --exit-code
→ No difference detected.        (code de sortie 0)
```

Le fichier de schéma est donc exactement ce que produisent les 2 migrations. Mesurer la production contre le schéma équivaut à la mesurer contre l'historique, et la décision de demain repose sur une comparaison et non sur une supposition.

2 effets de bord de cette vérification, consignés parce qu'ils se reproduiront : `migrate diff --from-migrations` exige `datasource.shadowDatabaseUrl` dans `prisma.config.ts`, ajouté et laissé vide par défaut puisque Prisma **réinitialise** cette base ; et la base jetable utilisée comme base d'ombre en est ressortie avec un schéma mais sans historique, donc en `P3005`, ce qui a demandé un `migrate reset` pour la remettre d'aplomb. Ne pas utiliser comme base d'ombre une base dont on veut garder le contenu.

Si la base est vide, ou ne contient que des essais, elle est réinitialisée elle aussi : l'historique devient honnête partout pour zéro coût, et cette fenêtre se referme définitivement dès que de vrais documents arrivent. Baseliner une base vide pour éviter une réinitialisation serait absurde.

Les 2 opérations demandent les identifiants de la base visée, que les variables sensibles de Vercel ne laissent pas lire : ils viennent de la console Neon.

### Résultat des mesures, et décision : la production est réinitialisée

Mesures lancées par l'utilisateur dans la console Neon le 2026-10-18.

| Mesure | Résultat |
|---|---|
| Données métier | **0 partout** : `Document`, `DocumentChunk`, `Conversation`, `Message`, `Memory`, `Profile`, `Goal`, `Project`, `Task`, `Verification` |
| Comptes | 11 `User`, 11 `Account`, 9 `Session`, **tous des comptes de test** créés le 2026-10-17 entre 19:57 et 20:45 : 3 exécutions Playwright, 1 inscription manuelle, 1 compte témoin |
| Développement d'octobre | aucun compte : l'authentification n'existait pas encore au 3 octobre |
| `_prisma_migrations` | `init` terminée le 3 octobre. `add_better_auth_tables` démarrée le 17 à 20:48, **0 étape appliquée, jamais résolue**, logs confirmant le `42701` sur `emailVerified` |

Il n'y a donc rien à garder. **Décision : la production est réinitialisée**, ce qui rend l'historique des migrations honnête au lieu de le déclarer, et fait disparaître la ligne en échec qui bloque les builds.

**Et l'ordre change, ce qui supprime 2 étapes.** La production est réinitialisée **avant** la création de la branche de preview, et non après. La branche de preview est alors créée depuis une production déjà saine : elle hérite d'un historique propre et de zéro compte. Disparaissent donc, devenus sans objet :

- le `migrate reset` sur la branche de preview ;
- l'ajout de son endpoint à `PRISMA_RESET_ALLOWED_HOSTS`, donc une liste blanche qui reste cantonnée au développement et au test ;
- la liste de suppression ciblée des comptes de test en production, qui n'était un repli que pour le cas où il y aurait eu quelque chose à garder.

C'est 2 étapes et 1 risque en moins, le risque étant qu'une commande destructrice ait eu besoin d'une liste blanche élargie.

### Ce que la réinitialisation recrée, et ce qu'elle n'emporte pas

`DROP SCHEMA public CASCADE` emporte les extensions installées dans ce schéma, pgvector comprise. **Vérifié : la migration `init` les recrée**, sa ligne 2 étant `CREATE EXTENSION IF NOT EXISTS "vector";`, avant les 16 `CREATE TABLE`. La seconde migration ajoute 3 tables. Aucune instruction manuelle n'est donc à lancer avant `pnpm db:deploy`.

À noter : aucune colonne de type vecteur n'existe encore dans le schéma, la dimension des embeddings n'étant pas tranchée (DEC-003). L'extension est créée mais n'est utilisée par rien aujourd'hui.

### Séquence réellement exécutée le 2026-10-18, par l'utilisateur

Dans cet ordre, dans les consoles Neon et Vercel.

| Étape | Résultat |
|---|---|
| `DROP SCHEMA public CASCADE` puis `CREATE SCHEMA public` sur la branche de production | schéma vidé |
| `pnpm db:deploy`, avec `DIRECT_URL` exportée pour cette seule commande puis retirée | `init` et `add_better_auth_tables` appliquées |
| Vérification | 2 lignes dans `_prisma_migrations`, `finished_at` au 2026-10-18 08:48:37, `applied_steps_count` à 1 chacune, `rolled_back_at` vide. 20 tables dans `public`, `vector` présente, `User` à 0 |
| Rotation du rôle `neondb_owner` sur les 3 branches, puis mise à jour des 2 entrées Production sur Vercel et des fichiers `.env` et `.env.test` | `pnpm db:audit` vérifié sur les 2 bases locales |
| Création de la branche de preview, **enfant de la production déjà saine** | née avec l'historique propre et 0 ligne |
| Les 2 entrées Preview de `DATABASE_URL` et `DIRECT_URL` pointent cette nouvelle branche | preview et production enfin séparés |
| 4 `BETTER_AUTH_SECRET` distincts : Production, Preview, `.env`, `.env.test` | plus aucun secret partagé entre environnements |

La ligne de migration en échec n'a pas eu à être résolue : elle a disparu avec le schéma, et l'historique est vrai au lieu d'être déclaré.

**Correction à consigner : les rôles Neon sont par branche, pas par projet.** Une rotation de mot de passe ne s'applique qu'à la branche sur laquelle elle est lancée, et une branche créée avant la rotation garde l'ancien mot de passe. C'est pourquoi les 3 branches ont été traitées séparément. À vérifier au prochain usage : une branche créée **après** une rotation hérite du mot de passe courant de son parent, donc l'ordre rotation puis création est le bon.

**Enseignement : un identifiant collé dans une conversation est un identifiant à faire tourner, point.** Pas de jugement sur la probabilité qu'il ait été lu ni sur la durée d'exposition : la rotation est le geste par défaut, immédiat, et il est bon marché. Ça rejoint la rule `bases-et-identifiants`, qui dit déjà que les identifiants de production ne circulent pas.

**Ce que la nouvelle disposition verrouille, définitivement.** La branche de preview naissant saine, le `migrate reset` sur cette branche n'existe plus, donc l'agent n'a aucun besoin de ses identifiants et il n'y a rien à ajouter à `PRISMA_RESET_ALLOWED_HOSTS`. **Les 2 listes blanches restent cantonnées au développement et au test.** Formulé comme règle : l'agent ne détient d'identifiants de base que sur `dev` et `test` ; la production et la preview vivent uniquement côté Vercel, qui les injecte dans ses propres builds et ses propres fonctions.

### Déploiement de contrôle après la séparation

Lancé juste après, sur le même code, pour vérifier que le câblage est bien celui annoncé.

| Vérification | Résultat |
|---|---|
| Build | `Ready` |
| Base visée par `migrate deploy` | `Datasource "db"` annonce `ep-frosty-bird-...`, la **nouvelle branche de preview**, sans suffixe `-pooler` |
| Migrations | `2 migrations found`, puis `No pending migrations to apply.` : la branche naît déjà à jour, le `migrate deploy` du build n'a plus rien à faire |
| `/api/health`, protection active | `200`, `{"status":"ok","service":"mimir-api"}` |
| Suite e2e | **5 sur 5**, en mode `PREVIEW_URL` |

Le `migrate deploy` du `buildCommand` ne devient utile qu'au premier déploiement qui apporte une migration de plus que la branche. C'est le comportement voulu, et le voir ne rien faire sur une branche à jour est la preuve qu'il est bien idempotent.

## Comptes de test sur la branche Neon de dev

Les tests créent de vrais utilisateurs sur la base de la branche de dev. Pour pouvoir les distinguer et les supprimer, **tout compte de test utilise le domaine `@mimir.test`**, que `uniqueEmail()` de `e2e/helpers.ts` produit déjà, avec un préfixe qui nomme le scénario (`signup-`, `session-`, `login-`). Aucun compte de test n'utilise un autre domaine.

Nettoyage, à lancer avec les variables de la branche visée :

```bash
cd packages/db
echo 'DELETE FROM "User" WHERE email LIKE '"'"'%@mimir.test'"'"';' \
  | pnpm exec dotenv -e ../../.env -- prisma db execute --stdin
```

Les lignes liées (`Session`, `Account`) partent avec, les clés étrangères étant en cascade. 2 pièges relevés en l'exécutant : la table est `"User"`, avec la majuscule du modèle Prisma et donc les guillemets obligatoires, et la commande `dotenv` n'a pas la même syntaxe selon l'endroit d'où on la lance.

**Pourquoi, et ma première explication était fausse.** J'avais attribué cet écart à 2 versions de `dotenv-cli`, la 8 à la racine et la 11 dans `packages/db`. Vérifié en remontant les shims de `node_modules/.bin` : ce sont **2 paquets différents qui revendiquent le même nom de binaire**.

| Depuis | Le binaire `dotenv` vient de | Syntaxe |
|---|---|---|
| la racine | `dotenv@18.0.5`, qui livre sa propre CLI depuis la v17 | `dotenv run -f fichier -- commande` |
| `packages/db` | `dotenv-cli@11.0.0` | `dotenv -e fichier -- commande` |

`dotenv-cli@8.0.0` est bien déclaré à la racine, mais il **perd la collision de nom** face à `dotenv@18` : son binaire n'y est jamais celui qui s'exécute. Les 2 versions de `dotenv-cli`, 8 et 11, attendent d'ailleurs exactement la même syntaxe `-e fichier --`, ce que leur propre texte d'aide confirme. La leçon tient en une phrase : quand une commande se comporte différemment selon le répertoire, remonter au binaire réellement résolu avant d'invoquer une différence de version.

## Option différée : supprimer le bundle au lieu de le faire tenir

Le bundle esbuild n'existe que pour l'alias `@/` dans `apps/api` et pour `@mimir/db` et `@mimir/shared`, qui exposent du TypeScript source. En passant `apps/api` en imports relatifs et en faisant produire du JavaScript compilé à ces 2 paquets, l'entrypoint devient un fichier source présent dans le dépôt et les risques alias, imports `.js`, externes pnpm et esbuild/`allowBuilds` disparaissent tous.

Coût mesuré : environ 45 fichiers. 2 `package.json` et 2 configs de build pour les paquets, puis les 31 fichiers de `apps/api/src/` qui importent en `@/`, tests compris, et le retrait de l'alias aux 4 endroits où il est câblé. Ça annule la rule `imports-backend` pour tout le backend.

Différé, mais pas pour le motif « Services sortira de Beta » : la résolution de l'entrypoint avant le build est très probablement un comportement voulu, pas un défaut de Beta, donc la sortie de Beta ne rendra pas `vercel.entry.js` inutile. Les déclencheurs réels sont :

- le bundle recasse ;
- un nouveau paquet du workspace est importé par l'API ;
- un 3e service est ajouté.

Une partie se détache et vaut par elle-même, indépendamment du bundle : faire produire du JavaScript compilé à `packages/db` et `packages/shared`, soit 4 fichiers. Ça ne supprime pas la passerelle et ne doit pas être présenté comme tel.

## Découpage des commits

1 commit par préoccupation, conformément à la rule `branches-et-commits` :

| Commit | Contenu |
|---|---|
| `docs(deploy)` | cette spec, DEC-012, amendement DEC-011 point 2, rappel roadmap |
| `chore(deploy)` | `vercel.json`, bundle esbuild, `prisma generate`, `.gitignore` |
| `refactor(auth)` | `authClient.ts` et `env.ts` avec leurs tests, les tests d'abord |
| `refactor(api)` | `/health` vers `/api/health`, `app.test.ts`, `playwright.config.ts`, strategie |

Les tests sont écrits avant le code de production, conformément à la rule `tests-tdd`. Pour `authClient.test.ts`, le test actuel exige une `baseURL` non vide : il est réécrit en premier pour exiger l'absence de `baseURL`, ce qui le fait échouer sur le code actuel, puis le code suit.
