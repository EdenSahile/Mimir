# Deploiement : une fusion dans `dev` construit la production, elle ne la met pas en ligne

L'environnement **Production** du projet Vercel suit la branche **`dev`**. L'environnement Preview suit toutes les autres branches. **Il n'y a pas de branche `main`.**

Verifie le 2026-10-18 dans Settings → Environments et par l'API Vercel, qui renvoie `productionBranch: dev`. Ne pas ecrire de procedure qui suppose un `main`.

## Corrige le 2026-10-29 : un deploiement `READY` ne sert pas forcement le domaine

Cette rule affirmait qu'il n'existe aucune etape de promotion apres la fusion. **C'est faux**, et ca a coute 10 jours de panne d'authentification en production.

### Ce qui est mesure

Le 2026-10-29, par `vercel inspect` et `vercel ls --prod` :

- `mimir-navy.vercel.app` servait un deploiement du **2026-10-18 12:43 CEST**, `dpl_GmaLZ75HPbmokiFPG7vjZFjrPKaE`.
- **15 deploiements de production crees apres lui** etaient tous `READY`, et aucun ne portait le domaine. Les 3 plus recents avaient 17 minutes.
- `vercel promote <url>` a deplace le domaine, et les 2 controles de sortie sont passes dans la minute.

La cause du `500` est etablie par le log d'execution, pas deduite d'un code HTTP : `P1000`, `Authentication failed against the database server`, `DriverAdapterError: AuthenticationFailed` levee par `PrismaNeonAdapter`. Mot de passe de base perime, fige dans le deploiement servi.

**Pourquoi la panne est invisible : les variables d'environnement sont figees dans le deploiement a sa creation.** Changer `DATABASE_URL` sur Vercel puis fusionner ne touche pas le deploiement qui sert, qui continue avec l'ancienne valeur. D'ou un `/api/health` a `200`, puisqu'il ne touche pas la base, et un `sign-in` a `500` pendant 10 jours.

### Le reglage : valeur inconnue pendant la panne

**`autoAssignCustomDomains` a ete lu a `true`** par `GET /v9/projects/{id}` de l'API Vercel le 2026-10-29. Et `GET /v9/projects/{id}/domains` rend `mimir-navy.vercel.app` avec `verified: true` et `gitBranch: null`, donc rattache a la production.

**Cette lecture ne vaut pas pour la periode de la panne**, et il faut 3 precisions pour ne pas s'y tromper.

1. Elle a ete faite **apres un `vercel promote`**, dans la meme session.
2. [vercel/vercel#15095](https://github.com/vercel/vercel/issues/15095) rapporte que `vercel promote` **remet ce champ a `true` a chaque appel**. Ouverte le 2026-02-18, sans reponse officielle ni correctif connu : c'est un rapport de bug, pas la documentation, donc confiance moyenne.
3. Donc **la valeur du 2026-10-18 au 2026-10-29 est inconnue, et le restera** : la mesure d'apres a efface l'etat d'avant. `autoAssignCustomDomainsUpdatedAt` est absent de la reponse de l'API, donc un changement n'est pas non plus datable.

Si le champ etait a `false` pendant la panne, le comportement est entierement explique : la [documentation Vercel sur la promotion](https://vercel.com/docs/deployments/promoting-a-deployment) dit que desactiver l'attribution des domaines pour la branche de production est precisement le mecanisme de la promotion manuelle. Ce n'est pas etabli, c'est l'hypothese la plus economique.

**Effet de bord a connaitre : un `promote` peut donc reactiver l'attribution automatique sans le dire.** Si `false` etait un choix delibere, il est a remettre apres chaque promotion, et a relire pour le verifier.

### Le protocole de resolution, a executer a la prochaine fusion

L'ordre compte, et la premiere etape est celle qui a manque.

1. **Avant tout deploiement**, lire et consigner le reglage :
   ```bash
   # avec le token du CLI, sans l'afficher
   GET https://api.vercel.com/v9/projects/<projectId>?teamId=<orgId>  ->  autoAssignCustomDomains
   ```
2. **Pousser**, et laisser la fusion construire son deploiement de production.
3. **Lire quel deploiement porte l'alias** :
   ```bash
   vercel inspect https://<domaine>
   ```

Les 3 issues, et ce qu'elles concluent :

| Observation | Conclusion |
| --- | --- |
| Le domaine suit tout seul | L'attribution automatique fonctionne, et la valeur pendant la panne etait **probablement `false`**. L'affaire est close. |
| Le domaine ne suit pas, alors que le reglage lit `true` | **Le reglage n'est pas le mecanisme.** Chercher ailleurs : rien dans les mesures actuelles n'explique alors la panne. |
| Le reglage lit `false` sans que personne ne l'ait touche | Probleme de configuration a instruire, et non un comportement de Vercel. |

Tant que ce protocole n'a pas tourne une fois, **ne rien affirmer sur la cause de l'epinglage**. Le comportement est mesure, son mecanisme ne l'est pas.

### Ce qu'on en fait

**Ne pas se fier au reglage, lire quel deploiement porte l'alias.** Apres toute fusion dont le resultat doit etre en ligne :

```bash
vercel inspect https://<domaine>          # l'identifiant du deploiement a-t-il change ?
```

Si l'identifiant n'a pas bouge, le domaine est reste en arriere, et `vercel promote <url-du-deploiement>` est une etape obligatoire de la procedure, quoi que dise le reglage.

**Tester le candidat avant de promouvoir**, sur son URL technique et non sur le domaine. 2 pieges s'y trouvent :

- La Deployment Protection garde les URL techniques et rend elle-meme un `401` sur `/api/auth/sign-in/email`, plus un `302` sur `/api/health`. Lu vite, ce `401` ressemble au resultat attendu alors qu'il vient de Vercel et n'a jamais atteint Express. Passer par `vercel curl <chemin> --deployment <url> -- <args curl>`, qui franchit la protection avec la session du CLI.
- Un `401` concluant se reconnait a **son corps**, `{"message":"Invalid email or password","code":"INVALID_EMAIL_OR_PASSWORD"}`, qui est celui de l'application. Le code HTTP seul ne distingue pas les 2 cas.

Un `500` sur le candidat signifie que le probleme n'est pas le domaine : ne rien promouvoir, revenir aux logs.

MIM-62 porte cette correction. MIM-56 ne couvre pas ce reglage, il porte le choix d'un nom de domaine.

## Consequence : les migrations partent AVANT la fusion

La production n'applique pas ses migrations pendant son build (DEC-012) : elle passe par `pnpm db:deploy`, lance par l'utilisateur. Donc **avant toute PR qui apporte une nouvelle migration, `pnpm db:deploy` est lance contre la production AVANT la fusion**. Sans ca, le code arrive sur un schema qu'il ne reconnait pas, et rien ne le migrerait.

**La base est alors en avance sur le code**, le temps de la fusion et de la mise en ligne. Tant que le domaine reste epingle, cette fenetre ne dure pas quelques minutes mais jusqu'a la promotion, donc potentiellement des jours. C'est acceptable ou non selon la nature de la migration.

- **Migration additive** (nouvelle table, nouvelle colonne nullable, nouvel index) : sans effet, l'ancien code ignore ce qu'il ne connait pas.
- **Migration destructrice** (colonne supprimee ou renommee, contrainte resserree, type change) : l'ancien code lit ou ecrit ce qui vient de disparaitre, et il casse. Elle demande un **decoupage en 2 temps**, 2 PR distinctes : d'abord une migration additive plus un code qui n'utilise plus l'ancienne forme, fusionne et deploye ; puis la migration qui supprime. Jamais les 2 dans la meme fusion.

Le test avant d'ecrire une migration : **est-ce que le code actuellement en production survit a cette migration pendant 5 minutes ?** Si non, elle se decoupe.

## Limite actuelle : cette rule n'a aucune application technique

Rien n'empeche une fusion qui oublie le `pnpm db:deploy`. Le code part alors sur une base en retard et sert des 500. Un ticket ouvert porte le filet manquant : un controle au demarrage de l'API qui compare les migrations enregistrees en base a celles du dossier `prisma/migrations` et refuse de servir si la base est en retard, en tolerant l'avance, qui est le cas normal de cette rule. Tant qu'il n'est pas fait, la regle repose sur la discipline.

## Les 3 champs de build du projet Vercel ne se touchent pas

Build Command, Output Directory et Install Command, au niveau du **projet** Vercel, restent renseignes : `pnpm --filter @mimir/web build`, `apps/web/dist`, `pnpm install --frozen-lockfile`. Ils ne sont pas inertes en mode `services`, contrairement a ce qui avait ete ecrit : ils commandent l'**empaquetage de la fonction**. Les vider a casse la production le 2026-10-18, les 2 routes de l'API repondant `500` sur `SyntaxError: Cannot use import statement outside a module`. Le meme commit redeploye avec les champs reactives repond `200`.

Les logs de build sont identiques avec et sans ces champs : ils ne peuvent pas servir a verifier ce point. La difference se lit dans le paquet de fonction, pas dans le build.

**Le piege, mesure :** ce qui compte est la **presence** d'un remplacement, pas sa valeur. Toute valeur d'Output Directory donne le bon paquet, y compris un dossier qui n'existe pas, **sauf la chaine `dist`**, qui est la valeur par defaut et se comporte comme un champ vide. Un « nettoyage » qui remettrait la valeur par defaut, croyant revenir a un etat neutre, casse donc la production aussi surement qu'un champ vide, et le build reste vert. Il n'y a pas d'etat neutre : il y a un remplacement, ou la panne.

## Une verification porte sur la chose elle-meme, pas sur un indicateur correle

Avant d'ecrire « verifie », s'assurer que la source consultee **pourrait** montrer le phenomene cherche. Une preuve d'absence tiree d'une source qui ne couvre pas le phenomene n'est pas une preuve. Et un fait repris d'une session anterieure n'est pas une mesure : le dire, ou le remesurer.

Les occurrences sur ce chantier sont consignees dans `docs/incidents.md`, qui est le journal. Elles n'ont pas leur place ici : une rule enonce une contrainte, elle ne tient pas le compte des fois ou elle a ete manquee.

Et le compte rendu **nomme ce qui a ete mesure et ce qui ne l'a pas ete**. « Le handler est correct » n'est pas « le paquet est correct » ; dire lequel des 2 a ete observe fait partie du resultat, pas des precautions.

## Ce que ca ne change pas

L'accord explicite de l'utilisateur est requis pour chaque fusion (rule `git`). Cette rule dit ce qu'une fusion declenche, elle n'autorise aucune fusion.
