# Deploiement : une fusion dans `dev` construit la production, elle ne la met pas en ligne

L'environnement **Production** du projet Vercel suit la branche **`dev`**. L'environnement Preview suit toutes les autres branches. **Il n'y a pas de branche `main`.**

Verifie le 2026-10-18 dans Settings → Environments et par l'API Vercel, qui renvoie `productionBranch: dev`. Ne pas ecrire de procedure qui suppose un `main`.

## Corrige le 2026-10-29 : la fusion ne suffit pas, le domaine est epingle

Cette rule affirmait qu'il n'existe aucune etape de promotion apres la fusion. **C'est faux**, et ca a coute 10 jours de panne d'authentification en production.

Le projet porte **`autoAssignCustomDomains: false`**. Un nouveau deploiement de production est donc construit, passe a `READY`, et **ne prend pas le domaine** : l'alias reste la ou une promotion l'a mis. Mesure du 2026-10-29 : `mimir-navy.vercel.app` servait encore un deploiement du **2026-10-18**, et les **7 deploiements de production posterieurs**, tous `READY`, ne servaient aucun trafic.

Consequence a retenir, parce qu'elle rend la panne invisible : **les variables d'environnement sont figees dans le deploiement a sa creation.** Changer `DATABASE_URL` sur Vercel puis fusionner ne touche donc pas le deploiement qui sert, qui continue avec l'ancienne valeur. C'est exactement ce qui a produit un `/api/health` a `200` et un `sign-in` a `500` pendant 10 jours.

Donc, apres toute fusion dont le resultat doit etre en ligne : **verifier quel deploiement porte l'alias**, pas seulement qu'un deploiement recent existe. Les 2 controles de sortie de la rule `bases-et-identifiants` sont faits pour ca, et le second est le seul qui touche la base.

Un ticket ouvert porte le choix de fond : reactiver l'attribution automatique du domaine, ou assumer une promotion explicite et l'ecrire dans la procedure.

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

Regle de methode, formulee apres l'avoir manquee 3 fois en 2 jours sur ce chantier.

- Panne d'**empaquetage** de la fonction : conclue « rien n'a change » en comparant les logs de **build**, qui ne decrivent pas l'empaquetage. Les logs sont identiques avec et sans les 3 champs.
- Correctif `.mjs` annonce comme valide : mesure faite sur le **handler** du paquet, pas sur son **contenu**. Un handler correct ne dit rien des modules presents a cote, et il manquait `cors`.

Donc : avant d'ecrire « verifie », s'assurer que la source consultee **pourrait** montrer le phenomene cherche. Une preuve d'absence tiree d'une source qui ne couvre pas le phenomene n'est pas une preuve.

Et le compte rendu **nomme ce qui a ete mesure et ce qui ne l'a pas ete**. « Le handler est correct » n'est pas « le paquet est correct » ; dire lequel des 2 a ete observe fait partie du resultat, pas des precautions.

## Ce que ca ne change pas

L'accord explicite de l'utilisateur est requis pour chaque fusion (rule `git`). Cette rule dit ce qu'une fusion declenche, elle n'autorise aucune fusion.
