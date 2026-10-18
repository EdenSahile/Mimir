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

1. **Le réglage Framework : la documentation et l'observation se contredisent, et l'observation gagne.** La base de connaissances Vercel affirme qu'« a project builds as services only when this setting is selected and a `services` key is present in `vercel.json` », et que si l'un des 2 manque, « Vercel falls back to its default framework detection and ignores your services configuration ». **Mesuré le 2026-10-18 par `vercel project inspect` : le Framework Preset du projet vaut `Other`**, et les déploiements ont pourtant bien construit 2 services distincts, la première erreur nommant même `Service "api"`. La présence de la clé `services` a donc suffi. Rien à changer, et la citation de la documentation est conservée ici pour mémoire : elle décrit une contrainte qui ne s'est pas vérifiée sur ce projet. Le cas de figure à surveiller reste l'inverse, un déploiement qui ne montrerait qu'un seul build.
2. **Vérifier que l'accès aux variables d'environnement système est activé.** Sans cette case, `VERCEL_ENV` et `VERCEL_URL` n'existent pas, et la dérivation de preview tombe sur le repli de développement.
3. **Vider les réglages de build du projet, par hygiène et non par nécessité.** Valeurs lues le 2026-10-18 par `vercel project inspect` : Build Command `pnpm --filter @mimir/web build`, Output Directory `apps/web/dist`, Install Command `pnpm install --frozen-lockfile`, Root Directory `.`. Les 3 premières sont l'héritage de la configuration d'avant le mode `services`. **Elles se sont révélées inertes** : les logs montrent que c'est le `buildCommand` du service `web` qui a tourné, `pnpm build` depuis `apps/web`, et non la commande du projet. Ma mise en garde initiale, « des réglages de tableau de bord concurrents peuvent prendre le dessus », n'est donc pas vérifiée ici. Les vider reste utile pour qu'un lecteur ne croie pas qu'elles gouvernent le build. En mode `services`, ces champs appartiennent aux services, et des réglages de tableau de bord concurrents peuvent prendre le dessus.
4. **Laisser Deployment Protection active, et créer un secret de contournement pour l'automatisation.** Deployment Protection → Protection Bypass for Automation → créer un secret, nommé pour son usage (« Playwright »). Vercel l'expose alors aux déploiements sous `VERCEL_AUTOMATION_BYPASS_SECRET`, et il faut **redéployer** pour qu'un déploiement existant le reçoive. Le même secret est déclaré en secret de dépôt GitHub, `Settings → Secrets and variables → Actions`, pour que la CI puisse viser un preview. Il n'entre jamais dans le dépôt. Motif du maintien de la protection dans DEC-012.
5. **Aucune variable à ajouter, mais une valeur à vérifier.** Preview n'a volontairement ni `FRONTEND_URL` ni `BETTER_AUTH_URL` : la dérivation depuis `VERCEL_URL` les remplace. Production garde les siennes. En revanche la **valeur** de `BETTER_AUTH_SECRET` doit être vérifiée différente entre Preview et Production, condition bloquante de DEC-012. Méthode sans afficher le secret : `vercel env pull` dans chaque environnement vers 2 fichiers du dossier temporaire, puis comparer les empreintes des 2 lignes et supprimer les fichiers.

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

## Verrou sur la promotion vers `main`

**Aucune promotion vers `main` avant que l'état de la base de production soit mesuré et traité.** La fusion dans `dev` ne dépend pas de cette mesure : la PR livre du code, l'état de la base est un acte d'exploitation. Mais le `migrate deploy` que ce code déclenche en preview a montré que les bases créées par `db push` sont désalignées de l'historique, et la production a probablement le même défaut. Promouvoir avant de l'avoir mesuré ferait découvrir le problème en production.

L'ordre est donc : mesurer (`prisma migrate diff` et `pnpm db:audit`), décider entre baseliner et réinitialiser, appliquer, puis promouvoir.

## Risque consigné, non corrigé dans MIM-37

**Version initiale de ce risque, fausse sur l'essentiel** : « tous les previews partagent une seule branche Neon de dev ». La branche partagée n'est pas celle de développement, c'est celle de **production**, et le risque n'est pas « faible aujourd'hui » mais réalisé. Voir le constat en tête de cette spec. Conservé ici pour montrer qu'un risque consigné sur la mauvaise base donne une fausse assurance : il a été écrit, relu et jugé acceptable, alors qu'il décrivait une situation qui n'existait pas.

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

## Cartographie des bases Neon

Établie par expérience, pas par lecture de configuration, après une contradiction dans mes propres comptes rendus sur l'identité des branches.

| Qui | Variable lue | Branche Neon | Rôle réel |
|---|---|---|---|
| Développement local (`pnpm dev:api`, `pnpm db:*`) | `.env` du dépôt | branche A | base de développement |
| Suite e2e locale et `globalSetup` | `.env.test` du dépôt | branche B | base de test, réinitialisée à chaque run |
| Déploiements de preview | `DATABASE_URL` de l'environnement Preview sur Vercel | branche C | **base de production** |
| Production | `DATABASE_URL` de l'environnement Production sur Vercel | très probablement la branche C | base de production |

Aucun endpoint de production n'existe dans les fichiers locaux du dépôt, `.env` et `.env.test` ne portant que les branches A et B.

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
| Production | `pnpm db:deploy production`, lancé à la main |
| Local | `pnpm db:deploy .env` ou `.env.test` |

`scripts/db-deploy.sh` prend **un chemin de fichier d'environnement**, et rien d'autre. La production n'est donc pas un mode à part : c'est le même chemin de code, avec un fichier différent, ce qui évite d'annoncer un chemin de production que rien n'exercerait.

**Pourquoi le fichier est fourni à la main.** La première version récupérait les variables de production depuis Vercel. Vérifié : ça ne marche pas. Les variables du projet sont marquées sensibles, donc `vercel env pull` les rapporte **vides** (`DATABASE_URL=""`), et `vercel env run` charge le `.env` local par-dessus, au point de renvoyer la même valeur pour Preview et pour Production. La promesse a été retirée plutôt que laissée en l'état. Les identifiants viennent de la console Neon, dans un dossier temporaire supprimé après usage, jamais dans le dépôt ni dans un chemin fixe.

### Procédure de déploiement en production

Dans cet ordre, et pas un autre :

1. **Migrer** : `pnpm db:deploy production`. Les migrations partent sur la connexion directe, pas sur le pooler.
2. **Vérifier** : la sortie liste les migrations appliquées. En cas de doute, rejouer la commande, qui est idempotente et répond « No pending migrations to apply ».
3. **Promouvoir** le déploiement de production depuis Vercel.

Le code part donc toujours sur un schéma déjà migré.

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

**Portée.** Ce n'est pas un défaut du chemin de migration, qui a fait exactement son travail : il a trouvé 2 migrations, en a appliqué 1 et s'est arrêté net sur l'incohérence. C'est l'état des bases créées avant que les migrations existent. La base de production a probablement été créée de la même façon, donc le premier `pnpm db:deploy production` échouera de la même manière si rien n'est fait.

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

### La liste de nettoyage est un repli

La suppression ciblée des comptes de test en production ne sert **que** s'il y a quelque chose à garder dans cette base. Si les mesures montrent 0 dans `Document`, `Message` et `Memory`, et uniquement des comptes de test dans `User`, la production est réinitialisée : l'historique des migrations redevient honnête partout, la ligne en échec disparaît, et la liste de suppression devient sans objet. Elle n'est donc pas le plan principal.

## Comptes de test sur la branche Neon de dev

Les tests créent de vrais utilisateurs sur la base de la branche de dev. Pour pouvoir les distinguer et les supprimer, **tout compte de test utilise le domaine `@mimir.test`**, que `uniqueEmail()` de `e2e/helpers.ts` produit déjà, avec un préfixe qui nomme le scénario (`signup-`, `session-`, `login-`). Aucun compte de test n'utilise un autre domaine.

Nettoyage, à lancer avec les variables de la branche visée :

```bash
cd packages/db
echo 'DELETE FROM "User" WHERE email LIKE '"'"'%@mimir.test'"'"';' \
  | pnpm exec dotenv -e ../../.env -- prisma db execute --stdin
```

Les lignes liées (`Session`, `Account`) partent avec, les clés étrangères étant en cascade. 2 pièges relevés en l'exécutant : la table est `"User"`, avec la majuscule du modèle Prisma et donc les guillemets obligatoires, et le `dotenv` de `packages/db` est en version 8, qui attend `-e fichier --` là où celui de la racine est en version 11 et attend `run -f fichier --`.

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
