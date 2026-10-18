# Mímir - Registre des décisions

## Décisions prises

### DEC-001 : Stack technique

**Date :** 2026-09-22
**Statut :** Validée

Frontend React + Vite + TypeScript, backend Node.js + Express + TypeScript, PostgreSQL sur Neon, Prisma, Better Auth, pgvector, Claude API.

### DEC-002 : Structure monorepo

**Date :** 2026-09-22
**Statut :** Validée

Monorepo avec pnpm workspaces. Deux apps (web, api), deux packages (db, shared).

### DEC-006 : Séparation des couches de données

**Date :** 2026-09-22
**Statut :** Validée

Cinq couches distinctes : données structurées (PostgreSQL), fichiers originaux (stockage objet), contenu indexé (pgvector), repositories externes (intégrations), environnement de dev (Claude Code). pgvector ne remplace pas le stockage du fichier original.

### DEC-007 : Projets comme entités structurées

**Date :** 2026-09-22
**Statut :** Validée

Un projet contient ses informations, ses documents liés, ses intégrations (GitHub, etc.). Un document personnel a project_id null. Ne pas confondre repository local de développement et repository externe accessible par Mímir.

### DEC-005 : Hébergement sur Vercel

**Date :** 2026-09-29
**Statut :** Validée

Frontend et backend hébergés sur Vercel. Le frontend (`apps/web`) est un build statique Vite. Le backend (`apps/api`) tournera en fonctions serverless.

Vercel convient parce que tout l'état de Mímir est externe (données sur Neon, fichiers sur stockage objet, auth et pgvector côté services), ce qui correspond au modèle serverless. Les blocages qui avaient forcé un autre projet (maison-buna) sur Render n'existent pas ici : pas de génération PDF via Chrome headless, pas de stockage sur disque local, pas de processus toujours allumé avec tâche planifiée en `setInterval`.

Deux contraintes de conception attachées à ce choix :

1. L'indexation et les embeddings (voir DEC-003) ne se font jamais en synchrone dans une requête HTTP, sous peine de dépasser la durée max d'une fonction. Ce travail passe par une tâche asynchrone (queue ou worker séparé).
2. Le streaming SSE des réponses Claude (voir DEC-009) reste borné par la durée max d'une fonction Vercel (jusqu'à 300s en Pro, 800s en Fluid Compute), largement suffisant pour une réponse IA.

Toute tâche planifiée (purge, rappel) se fait via Vercel Cron, jamais via un `setInterval` dans le serveur.

### DEC-011 : Authentification via Better Auth

**Date :** 2026-10-08
**Statut :** Validée

L'authentification (inscription, connexion, sessions) passe par Better Auth, avec l'adaptateur Prisma sur la base Neon. Les tables `Session`, `Account` et `Verification` vivent dans le schéma Prisma aux côtés de `User`.

Deux points de câblage non évidents :

1. Le handler Better Auth est monté sur `/api/auth/*`, **avant** `express.json()`. Better Auth lit le corps brut des requêtes : un `express.json()` placé avant le viderait et casserait l'authentification.
2. ~~En développement, le frontend (port 5173) et l'API (port 3001) sont sur des origines différentes, donc le cookie de session est cross-origin. L'API active CORS avec `credentials`, et le client Better Auth renvoie le cookie sur chaque requête.~~

   **Amendé le 2026-10-17 par DEC-012.** Le développement n'est plus cross-origin. Le client Better Auth n'a plus de `baseURL` : il tape la même origine, et le proxy de `vite.config.ts` renvoie `/api` vers le port 3001. Le navigateur ne parle donc qu'au port 5173. CORS reste en place pour l'instant, mais devient inutile dans les 3 environnements et sera retiré dans un second temps.

`GET /api/me` expose l'utilisateur de la session courante (réponse à plat, l'objet utilisateur directement), protégé par `requireAuth`. Côté frontend, `AuthGuard` garde les routes internes et redirige vers `/login` sans session.

### DEC-012 : 1 projet Vercel, 2 services, authentification same-origin

**Date :** 2026-10-17
**Statut :** Validée
**Amende :** DEC-011 point 2

DEC-005 tranchait l'hébergement sur Vercel sans trancher la topologie. Elle est fixée ici : **1 seul projet Vercel contenant 2 services** au sens de Vercel Services, `web` avec pour racine `apps/web` et `api` avec pour racine `apps/api`. Les 2 sont construits séparément mais déployés ensemble, derrière un domaine unique et une URL de preview unique.

Les backends d'un projet Services tournent comme des Vercel Functions sur Fluid Compute, ce qui reste conforme à DEC-005 : le modèle d'exécution serverless ne change pas, seule la déclaration change.

L'alternative écartée était 2 projets Vercel séparés, avec un domaine par projet et `VITE_API_URL` côté frontend. Motif du rejet : elle impose CORS et des cookies cross-site en production, soit précisément la complexité que le domaine unique supprime.

**Conséquence sur l'authentification.** Le frontend et l'API partagent la même origine. `baseURL` disparaît du client Better Auth, qui tape alors son chemin par défaut `/api/auth` sur la même origine, là où le serveur monte déjà le handler. Le développement devient same-origin lui aussi via le proxy Vite, d'où l'amendement de DEC-011 point 2.

**Conséquence sur les URLs de preview.** Les URLs de preview sont générées par déploiement, donc des variables fixes ne peuvent pas les couvrir. `FRONTEND_URL` et `BETTER_AUTH_URL` restent des variables fixes en production, et ne sont dérivées de `VERCEL_URL` (avec `https://` ajouté à la main, cette variable ne portant pas le protocole) que lorsque `VERCEL_ENV` vaut `preview`. Ne pas dériver la production de `VERCEL_URL` : elle porte l'URL `*.vercel.app` propre au déploiement et non le domaine personnalisé, ce qui enverrait cookies et origines de confiance sur le mauvais hôte. `trustedOrigins` suit cette même valeur.

#### Constat du 2026-10-18 : Preview et Production désignent la même base

Vérifié dans la console Neon : la branche que `DATABASE_URL` de l'environnement **Preview** désigne est la branche de **production**. Il n'existe pas de branche de preview distincte.

**Ce que ça annule.** La sous-section « Migrations » ci-dessous découpe le traitement entre preview et production. Ce découpage **ne produit aucun effet** tant que les 2 environnements pointent la même base : `migrate deploy` conditionné à `VERCEL_ENV === "preview"` a tourné 2 fois contre la production, et seul son échec sur `column "emailVerified" already exists` a empêché une modification de schéma non décidée. De même, la phrase « la base de preview est jetable », qui justifiait de migrer automatiquement en preview, était fausse.

**Ce que ça ne change pas.** Le raisonnement sur les 2 profils de risque reste valable, et c'est même lui qui est bafoué ici. Il redevient applicable dès que les previews ont leur propre branche Neon, ce qui est le préalable à toute remise en service du dispositif.

**La cause.** Une branche nommée par son rôle dans Vercel au lieu de son identité chez le fournisseur. D'où les 2 règles suivantes.

**L'identité d'une base cible se vérifie dans la console du fournisseur, jamais d'après le nom d'une variable d'environnement.** Un nom de variable dit quel environnement la lit, pas quelle base elle désigne.

**Un garde-fou que l'agent peut éditer est un pense-bête, pas un contrôle.** L'agent qui écrit le verrou détient aussi la clé. Les contrôles réels sont ceux que l'utilisateur détient : les identifiants, et la vérification à la source. Corollaire absolu : **l'endpoint de production n'entre dans aucune liste blanche, ni `reset`, ni `push`, jamais.** Une opération qui l'exigerait est refusée et signalée.

**2 rotations de secrets, causes distinctes.** `BETTER_AUTH_SECRET` est renouvelé en Production **et** en Preview parce que la même valeur portait les 2 portées, donc un jeton signé en preview **aurait valu** en production. Portée réelle plus faible qu'annoncée d'abord : le projet ne déploie que le frontend, aucune API ne tourne en production, donc ce secret n'a jamais rien signé et rien n'est à redéployer. La nouvelle valeur sera lue au premier déploiement réel de l'API. Les 8 comptes de test présents dans la base de production y sont entrés par les previews, jamais par la production. Les mots de passe des rôles Neon sont renouvelés sur les 3 branches parce que les endpoints figurent dans un dépôt public ; un endpoint n'est pas un identifiant, mais le mot de passe devient alors le seul rempart. Les 2 rotations ne se déclenchent pas pour les mêmes raisons et ne se remplacent pas.

**Exposition de l'endpoint.** Le commit `7330824`, poussé sur un dépôt public, contient l'endpoint de la branche de production dans une liste blanche codée en dur. Décision : **ni réécriture de l'historique, ni recréation de la branche**, parce qu'un endpoint n'est pas un identifiant et qu'une réécriture serait cosmétique, les objets restant accessibles par leur SHA. Le seul élément sensible est le mot de passe : **les mots de passe des 3 branches Neon sont mis en rotation**. Sujet clos.

**Préalable à la reprise.** Une branche Neon dédiée au preview, créée depuis la production, puis des variables Vercel déclarées par environnement avec des valeurs distinctes, `BETTER_AUTH_SECRET` compris. Le correctif de fond, une branche éphémère par déploiement, passe en priorité.

#### Traitement du 2026-10-18 : le constat est soldé

Exécuté par l'utilisateur dans les consoles Neon et Vercel, dans cet ordre. **La production est réinitialisée** (`DROP SCHEMA public CASCADE`, puis `pnpm db:deploy`) : elle ne contenait aucune donnée métier, seulement 11 comptes de test créés la veille par les previews, et une ligne de migration en échec qui bloquait les builds. Les 2 migrations sont désormais enregistrées terminées, l'historique est vrai au lieu d'être déclaré, et `migrate resolve --applied` n'a pas eu à être employé. **La branche de preview est créée ensuite, comme enfant de cette production saine** : elle naît avec un historique propre et zéro ligne, et les 2 entrées Preview de `DATABASE_URL` et `DIRECT_URL` pointent dessus. **Les 4 `BETTER_AUTH_SECRET` sont distincts** (Production, Preview, `.env`, `.env.test`), et les mots de passe des rôles Neon ont tourné sur les 3 branches.

**Ce que l'ordre inverse a supprimé.** Réinitialiser la production **avant** de créer la branche de preview retire le `migrate reset` qui était prévu sur cette branche, donc l'élargissement de `PRISMA_RESET_ALLOWED_HOSTS` qu'il aurait demandé, donc le besoin pour l'agent d'en détenir les identifiants. **Les 2 listes blanches restent cantonnées à `dev` et `test`, définitivement.** C'est une étape et un risque en moins, obtenus en changeant un ordre, pas en ajoutant un contrôle.

**Les rôles Neon sont par branche, pas par projet.** Une rotation de mot de passe ne vaut que pour la branche sur laquelle elle est lancée, et une branche créée avant la rotation garde l'ancien mot de passe. D'où les 3 branches traitées séparément, et l'ordre rotation puis création pour une branche enfant.

**Enseignement : un identifiant collé dans une conversation est un identifiant à faire tourner, point.** Sans évaluer la probabilité qu'il ait été lu ni la durée de l'exposition. La rotation est le geste par défaut et elle est bon marché, contrairement à l'enquête qui essaierait de l'éviter. Consigné dans la rule `bases-et-identifiants`.

#### Correction du 2026-10-18 : les 3 champs de build du projet sont nécessaires, pas inertes

La version précédente de cette décision prévoyait, après la fusion, de **vider les 3 champs de build du projet** (Build Command, Output Directory, Install Command), déclarés inertes en mode `services`. **Cette étape est supprimée : elle est fausse, et son exécution a cassé la production.** Les 2 routes de l'API sont reparties en `500 FUNCTION_INVOCATION_FAILED`, sur `SyntaxError: Cannot use import statement outside a module`.

Ces 3 champs ne gouvernent pas le build des services, ils gouvernent l'**empaquetage de la fonction**. Mesure : le même commit `b6717b5` redéployé avec les champs réactivés répond `200`, les logs de build étant identiques dans les 2 cas. Le champ qui porte l'effet est l'**Output Directory**, et le constructeur réagit à la présence d'un remplacement explicite, pas à sa valeur. Sans ce remplacement, le handler devient un `index.js` à la racine d'un paquet sans `package.json`, donc Node charge un bundle ESM comme du CommonJS. Détail complet dans la spec de MIM-37.

**L'entrypoint et le bundle passent en `.mjs`** (`apps/api/vercel.entry.mjs`, `dist/index.mjs`). Un `.mjs` est ESM par son extension : le format ne dépend plus d'aucun `package.json` ni de ce que le paquet contient. Les 3 champs restent nécessaires, mais cette classe de panne ne dépend plus de 3 réglages de tableau de bord.

**Enseignement de méthode.** Le premier diagnostic a conclu que les 3 champs étaient inertes en comparant les **logs de build**, qui ne décrivent pas l'empaquetage. Une preuve d'absence tirée d'une source qui ne couvre pas le phénomène n'est pas une preuve : avant d'écrire « rien n'a changé », vérifier que la source consultée pourrait montrer le changement cherché.

#### Migrations : automatiques en preview, délibérées en production

Preview et production n'ont pas le même profil de risque. La base de preview est jetable, celle de production contiendra des documents personnels. Les 2 environnements ne suivent donc pas le même chemin :

- **Preview** : `prisma migrate deploy` dans le `buildCommand` du service `api`, conditionné à `VERCEL_ENV === "preview"`. Aucune friction, et un preview teste toujours le code contre son propre schéma.
- **Production** : **pas dans le build**. Une commande versionnée du dépôt, `DIRECT_URL="..." pnpm db:deploy`, la variable passée pour cette seule commande, lancée délibérément par l'utilisateur **avant la fusion dans `dev`**.

**Correction du 2026-10-18 : il n'y a pas de `main`, et pas d'étape de promotion.** L'environnement Production du projet Vercel suit la branche **`dev`**, Preview suit toutes les autres branches, et le dépôt n'a pas de branche `main`. Vérifié dans Settings → Environments et par l'API Vercel, qui renvoie `productionBranch: dev`. Les versions précédentes de cette décision décrivaient un « verrou sur la promotion vers `main` » qui ne correspondait à rien : **chaque fusion dans `dev` déploie la production**. La fusion de la PR de MIM-37 est donc le premier déploiement de l'API en production, et le verrou porte sur cette fusion.

Conséquence sur l'ordre, écrite dans la rule `deploiement-production` parce qu'elle vaut au-delà de MIM-37 : `pnpm db:deploy` part **avant** la fusion, donc la base est en avance sur le code pendant quelques minutes. Sans effet pour une migration additive, fatal pour une migration destructrice, qui demande un découpage en 2 PR, l'additive et le code qui s'en passe d'abord, la suppression ensuite.

Même erreur de méthode que pour l'identité des branches Neon : un nom plausible employé sans vérification à la source, et une procédure écrite par-dessus.

Les 2 alternatives ont été écartées pour des motifs symétriques. **Migrer dans le build partout** mettrait la production en migration automatique à chaque merge : si la migration passe et que le build échoue ensuite, la base est migrée sans que le code correspondant soit en ligne. **Sortir la migration du build partout** mettrait une étape manuelle là où on veut zéro friction, et poserait un problème d'ordre, puisque c'est le push qui déclenche le déploiement : il faudrait migrer avant que le code soit en ligne.

Le défaut connu de ce choix est que le chemin de production n'est exercé par aucun preview, et c'est exactement ce genre d'écart qui a produit le trou initial, `prisma generate` présent et `migrate deploy` absent. 3 conditions le ferment :

1. La commande de production est **scriptée et versionnée** (`scripts/db-deploy.sh`), jamais tapée de mémoire.
2. Elle est **exercée au moins une fois** contre une branche Neon jetable, résultat consigné dans la spec.
3. La **procédure de déploiement en production est écrite** dans la spec, dans l'ordre : migrer, vérifier, fusionner.

**Les migrations ne passent pas par l'URL poolée.** PgBouncer en mode transaction supporte mal les verrous consultatifs et les instructions de session dont les migrations ont besoin. `DIRECT_URL`, la connexion directe de Neon, est donc obligatoire, et existe dans les 2 environnements Vercel. Relevé en vérifiant ce point : sur Prisma 7.10, `directUrl` déclaré dans `prisma.config.ts` **n'était pas emprunté** par `migrate deploy`, qui se connectait au host poolé. Le choix de l'URL du CLI est donc explicite, dans `packages/db/cliDatasource/`, que `prisma.config.ts` traverse sur les 2 chemins de migration. Le défaut y est l'exigence de la connexion directe, et seul `prisma generate` est autorisé sur la connexion poolée : une commande sans `DIRECT_URL`, ou avec une `DIRECT_URL` poolée, **lève**. Le même endroit restreint `db push` aux bases de développement local et de test, puisque c'est lui qui a désaligné la base de preview de l'historique des migrations. Pas de repli sur `DATABASE_URL`, pour la même raison qu'il est interdit dans `env.ts` : un repli silencieux renvoie les migrations par le pooler sans un mot. `prisma generate`, qui ne se connecte à rien, continue de fonctionner sans aucune variable, ce dont la CI dépend.

#### Deployment Protection sur les previews : maintenue

La protection standard **reste active sur les previews**, en production comme en preview. Mímir stocke des documents personnels (`Document`, `Memory`, `Message`) : un preview public donnerait accès à ces données à quiconque possède l'URL, et une URL de preview circule par nature dans les PR, les notifications et les historiques de navigateur.

**Pourquoi cette décision a changé.** La version initiale de DEC-012 désactivait la protection sur les previews, de façon temporaire et conditionnée, sur une prémisse jamais testée : que la protection empêchait de valider l'authentification, parce que `VERCEL_URL` est documentée comme inutilisable avec elle et qu'un second cookie d'authentification sur le même hôte brouillerait le test du cookie de session. La validation de MIM-37 a montré que la prémisse était fausse. Le mécanisme découvert : `vercel curl --deployment <url>` génère un jeton de contournement et l'envoie dans l'en-tête `x-vercel-protection-bypass`, ce qui traverse la protection sans la lever. La séquence complète (`/api/health`, inscription, connexion, cookie de session, `/api/me`) est passée **protection active**, et le cookie `__Secure-better-auth.session_token` est resté parfaitement distinct du cookie SSO de Vercel. L'exemption n'a donc jamais servi, et une exemption morte finit par être utilisée : elle est supprimée plutôt que conditionnée.

**Conséquence sur les tests automatisés.** Playwright ne passe pas par le CLI : il utilise le mécanisme HTTP documenté. `playwright.config.ts` lit `PREVIEW_URL` et `VERCEL_AUTOMATION_BYPASS_SECRET`, et envoie 2 en-têtes sur chaque requête, `x-vercel-protection-bypass` avec le secret et `x-vercel-set-bypass-cookie: true` pour que les navigations du navigateur qui suivent passent aussi. Sans le secret, la configuration échoue au démarrage avec la cause, au lieu de laisser 5 tests échouer sur une page de connexion. Le secret n'entre jamais dans le dépôt : il est créé dans Deployment Protection → Protection Bypass for Automation, d'où Vercel l'expose aux déploiements comme variable système, et il est déclaré en secret de dépôt GitHub pour la CI.

**Règle permanente sur les identifiants.** Un agent n'a d'identifiants que sur `dev` et `test`. La production et la preview vivent uniquement côté Vercel, qui les injecte dans ses propres builds et ses propres fonctions. La production se **mesure** par une commande en lecture seule dont l'utilisateur transmet la sortie, et s'**écrit** par une commande que l'utilisateur lance lui-même, `pnpm db:deploy` restant la sienne. Écrite en détail dans la rule `bases-et-identifiants`, parce que c'est une contrainte de comportement et pas seulement une décision d'architecture.

**Règle permanente :** `DATABASE_URL`, `BETTER_AUTH_SECRET` et le futur bucket de stockage objet sont **distincts entre Production et Preview**. Un preview ne touche jamais les données de production.

`BETTER_AUTH_SECRET` mérite une justification propre, parce que le raisonnement « les sessions sont en base, donc un secret partagé est sans effet » est faux. Ce secret signe aussi des jetons **sans état** : vérification d'email, réinitialisation de mot de passe, et un éventuel plugin JWT plus tard. Partagé entre Preview et Production, il donne à toute personne ayant accès aux previews une clé de signature valable en production. 2 réserves sur la méthode de comparaison :

- **Ne pas écrire les secrets de production en clair dans `/tmp`.** Un `vercel env pull` vers un chemin fixe laisse le secret sur le disque, lisible et oublié. Passer par un dossier `mktemp -d` supprimé juste après, ou par un tube.
- **Les variables de Preview peuvent être limitées à une branche.** Un `vercel env pull` sans `--git-branch` rapporte alors la valeur d'une autre branche que celle testée, et la comparaison ne dit rien. Préciser la branche.

---

## Décisions ouvertes

### DEC-003 : Fournisseur et dimension des embeddings

**Statut :** En attente

Le fournisseur d'embeddings n'est pas choisi. Options envisagées : OpenAI text-embedding-3-small (1536 dimensions), Voyage AI, modèle open source. La dimension des vecteurs n'est pas figée. Le schéma Prisma ne contient pas encore de colonne vector sur DocumentChunk et Memory. Elle sera ajoutée par une migration SQL brute quand la décision sera prise. Les interfaces `EmbeddingService` et `EmbeddingConfig` dans `packages/shared` permettent de changer de fournisseur sans modifier le reste du code.

**Critère ajouté le 2026-10-18 :** le fournisseur d'embeddings reçoit le **contenu des documents personnels**, c'est donc un sous-traitant au sens du RGPD, et la localisation de son traitement entre dans le choix au même titre que la dimension et le coût. Voir le ticket RGPD ouvert dans `docs/specs/2026-10-17-deploy-vercel-services-design.md`.

### DEC-004 : Fournisseur de stockage objet

**Statut :** En attente

Le fournisseur de stockage des fichiers utilisateurs n'est pas choisi. Options envisagées : Cloudflare R2 (compatible S3, moins cher), AWS S3, Supabase Storage. L'interface `StorageService` dans `packages/shared` permet de changer de fournisseur sans modifier le reste du code. Pour le développement local, un stockage sur disque peut suffire temporairement.

### DEC-008 : Modèle économique

**Statut :** En attente

Gratuit, freemium, payant ? Impacte la gestion des quotas API Claude, le rate limiting, et l'architecture de billing.

### DEC-009 : Streaming des réponses IA

**Statut :** En attente

SSE (plus simple, suffisant pour du texte unidirectionnel) ou WebSocket (bidirectionnel, plus complexe). SSE recommandé pour le MVP.

### DEC-010 : Nom de domaine

**Statut :** En attente
