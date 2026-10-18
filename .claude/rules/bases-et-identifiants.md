# Bases de donnees : identifiants et actes d'exploitation

Les bases de ce projet ne se valent pas. Les identifiants qu'un agent detient, et ce qu'il a le droit d'en faire, suivent cette distinction.

## Un agent n'a d'identifiants que sur `dev` et `test`

Ces 2 bases sont jetables : la base de developpement local (`.env`) et celle de test (`.env.test`). Elles ne contiennent que des donnees de travail et des comptes de test, et peuvent etre reconstruites a tout moment par les migrations.

**La production et la preview vivent uniquement cote Vercel**, qui injecte leurs identifiants dans ses propres builds et ses propres fonctions. Un agent ne recoit pas ces identifiants, ni pour une lecture, ni temporairement, ni « juste pour verifier ». Ne pas les demander.

La preview a quitte la liste des bases dont l'agent detient les identifiants le 2026-10-18 : sa branche Neon est creee comme enfant d'une production deja saine, donc elle nait avec un historique de migrations propre et aucune ligne. Il n'y a plus de `migrate reset` a lancer dessus, donc plus aucune raison d'en detenir les identifiants.

## Un identifiant colle dans une conversation est un identifiant a faire tourner

Sans evaluer la probabilite qu'il ait ete lu ni la duree de l'exposition : la rotation est le geste par defaut, immediat. Elle est bon marche, contrairement a l'enquete qui essaierait de l'eviter.

**Les roles Neon sont par branche, pas par projet.** Une rotation ne s'applique qu'a la branche sur laquelle elle est lancee, et une branche creee avant la rotation garde l'ancien mot de passe. Traiter chaque branche separement, et faire tourner avant de creer une branche enfant.

## La production se mesure par des resultats transmis

Quand l'etat de la production est necessaire, l'agent ne va pas le chercher : il **fournit la commande exacte**, en lecture seule, et l'utilisateur lui colle la sortie. Les commandes de mesure sont donc versionnees dans le depot plutot qu'improvisees, et leur sortie ne doit contenir ni identifiant, ni chaine de connexion, ni donnee personnelle. `pnpm db:audit` est faite pour ca.

**Forme recommandee : les variables dans le shell, pas dans un fichier.**

```bash
DATABASE_URL="..." DIRECT_URL="..." pnpm db:audit
```

Un fichier d'identifiants, meme dans le repertoire personnel et meme supprime apres, reste lisible pendant son existence par n'importe quel processus de la machine, dont un shell d'agent. Le passer en variable pour une seule commande ne l'ecrit jamais sur le disque : la protection devient une construction au lieu d'une norme. `pnpm db:audit` et `pnpm db:deploy` acceptent les 2 formes, et refusent de demarrer sans l'une des 2.

Les commandes ne nomment jamais les endpoints dans le depot. Les listes blanches des commandes destructives sont declarees par `PRISMA_PUSH_ALLOWED_HOSTS` et `PRISMA_RESET_ALLOWED_HOSTS`, qui vivent dans les fichiers d'environnement non suivis : ce depot est public, et un endpoint est la moitie d'une chaine de connexion.

## La production s'ecrit par une commande que l'utilisateur lance

`pnpm db:deploy` reste **une commande de l'utilisateur** sur la production. L'agent la prepare, la teste sur une base jetable et documente la procedure ; il ne l'execute pas contre la production.

## Corollaire sur les commandes destructives

`prisma migrate reset` et `prisma db push` sont restreints par liste blanche de hosts, appliquee dans `packages/db/cliDatasource` et declaree par l'environnement. **Liste absente vaut refus** : ni la production ni la preview n'ont de raison de porter ces variables, et c'est ce qui les protege par construction. **Les 2 listes restent cantonnees a `dev` et `test`, definitivement** : elles ne s'elargissent pas pour faire passer une commande qui bloque, et l'endpoint de production n'y entre jamais, sous aucun pretexte. Si une operation exige de l'y ajouter, la refuser et le dire.

Ne pas presenter cette liste comme le dernier rempart : elle a deja contenu l'endpoint de production sous un mauvais nom (commit `7330824`). Un garde-fou ecrit par celui qu'il est cense contraindre ne vaut que ce que vaut l'information qu'il contient. Le controle reel est la detention des identifiants, et l'identite d'une base cible se verifie dans la console du fournisseur, jamais d'apres le nom d'une variable d'environnement.

## Ce que ca ne change pas

Un acte destructeur sur une base jetable reste soumis a l'accord explicite de l'utilisateur, demande juste avant, pour cette operation precise.
