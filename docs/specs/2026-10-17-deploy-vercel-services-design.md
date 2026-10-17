# Déploiement du backend sur Vercel (MIM-37)

**Date :** 2026-10-17
**Ticket :** MIM-37 « Déployer frontend et backend »
**Branche :** `chore/MIM-37-deploy-vercel-services`
**Décisions liées :** DEC-005 (hébergement Vercel), DEC-011 (Better Auth, point 2 amendé), DEC-012 (nouvelle)

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

Node 24 est la version configurée sur le projet Vercel, d'où `target: "node24"`.

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
| `e2e/globalSetup.ts` | pas de reset de base en mode preview |
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

1. **Passer le réglage Framework du projet sur « Services ».** Build and Deployment Settings. Vérifié dans la documentation Vercel : « A project builds as services only when this setting is selected and a `services` key is present in `vercel.json` », et « If either is missing, Vercel falls back to its default framework detection and ignores your services configuration ». La contrainte vaut bien pour le modèle `services` courant, pas seulement pour l'ancien `experimentalServices`. C'est le réglage le plus déterminant de la liste : sans lui, le `vercel.json` est ignoré en silence et le déploiement ressemble à l'ancien, sans api.
2. **Vérifier que l'accès aux variables d'environnement système est activé.** Sans cette case, `VERCEL_ENV` et `VERCEL_URL` n'existent pas, et la dérivation de preview tombe sur le repli de développement.
3. **Vider les réglages de build du tableau de bord.** Le projet porte aujourd'hui un Build Command, un Output Directory et un Install Command définis au niveau du projet. En mode `services`, ces champs appartiennent aux services, et des réglages de tableau de bord concurrents peuvent prendre le dessus.
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

## Comptes de test sur la branche Neon de dev

Les tests créent de vrais utilisateurs sur la base de la branche de dev. Pour pouvoir les distinguer et les supprimer, **tout compte de test utilise le domaine `@mimir.test`**, que `uniqueEmail()` de `e2e/helpers.ts` produit déjà, avec un préfixe qui nomme le scénario (`signup-`, `session-`, `login-`). Aucun compte de test n'utilise un autre domaine.

Nettoyage, à lancer avec les variables de la branche visée :

```bash
pnpm --filter @mimir/db exec prisma db execute --stdin <<< "DELETE FROM \"user\" WHERE email LIKE '%@mimir.test';"
```

Les lignes liées (`session`, `account`) partent avec, les clés étrangères étant en cascade.

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
