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
| `apps/api/src/app/app.test.ts` | 2 tests mis à jour |
| `apps/web/src/lib/authClient.ts` | suppression de `baseURL` |
| `apps/web/src/lib/authClient.test.ts` | réécrit |
| `apps/web/vite.config.ts` | `strictPort: true` |
| `playwright.config.ts` | URL d'attente mise à jour |
| `testing/strategie-MIM-23.md` | 3 mentions mises à jour |
| `docs/decisions.md` | DEC-012 et amendement DEC-011 point 2 |
| `docs/roadmap.md` | rappel de réactivation de la protection |

Fichiers explicitement **non modifiés** : `apps/api/src/index.ts`, `apps/api/src/app/app.ts`, `apps/api/src/config/auth.ts`.

**Pourquoi `vite.config.ts` a finalement bougé.** Le proxy `/api` y existait déjà et n'avait rien à changer, mais le passage en same-origin a rendu le port du frontend significatif. Avant, `baseURL` pointait en dur sur le port 3001 et le port du serveur de dev n'avait aucune importance. Maintenant le navigateur appelle sa propre origine : si Vite se rabat sur un autre port parce que 5173 est pris, cette origine ne correspond plus à `trustedOrigins` et l'authentification casse sans message clair. `strictPort: true` fait échouer le démarrage franchement au lieu de glisser en silence.

## Réglages à faire sur Vercel, hors code

1. **Désactiver Standard Deployment Protection sur les previews.** Vérifié empiriquement : un appel sur le dernier preview renvoie un `302` vers `vercel.com/sso-api`. Conditions et échéance de réactivation dans DEC-012.
2. **Vérifier que l'accès aux variables d'environnement système est activé.** Sans cette case, `VERCEL_ENV` et `VERCEL_URL` n'existent pas, et la dérivation de preview tombe sur le repli de développement.
3. **Vider les réglages de build du tableau de bord.** Le projet porte aujourd'hui un Build Command, un Output Directory et un Install Command définis au niveau du projet. En mode `services`, ces champs appartiennent aux services, et des réglages de tableau de bord concurrents peuvent prendre le dessus.
4. **Aucune variable à ajouter.** Preview n'a volontairement ni `FRONTEND_URL` ni `BETTER_AUTH_URL` : la dérivation depuis `VERCEL_URL` les remplace. Production garde les siennes.

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

## Séquence de validation sur le preview

1. `/api/health` répond.
2. L'inscription sur `/signup` aboutit.
3. La connexion aboutit.
4. Le cookie de session est bien posé sur le domaine du preview.
5. `/api/me` renvoie l'utilisateur avec ce cookie.

## Découpage des commits

1 commit par préoccupation, conformément à la rule `branches-et-commits` :

| Commit | Contenu |
|---|---|
| `docs(deploy)` | cette spec, DEC-012, amendement DEC-011 point 2, rappel roadmap |
| `chore(deploy)` | `vercel.json`, bundle esbuild, `prisma generate`, `.gitignore` |
| `refactor(auth)` | `authClient.ts` et `env.ts` avec leurs tests, les tests d'abord |
| `refactor(api)` | `/health` vers `/api/health`, `app.test.ts`, `playwright.config.ts`, strategie |

Les tests sont écrits avant le code de production, conformément à la rule `tests-tdd`. Pour `authClient.test.ts`, le test actuel exige une `baseURL` non vide : il est réécrit en premier pour exiger l'absence de `baseURL`, ce qui le fait échouer sur le code actuel, puis le code suit.
