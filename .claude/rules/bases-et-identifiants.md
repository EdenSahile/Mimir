# Bases de donnees : identifiants et actes d'exploitation

Les bases de ce projet ne se valent pas. Les identifiants qu'un agent detient, et ce qu'il a le droit d'en faire, suivent cette distinction.

## Un agent n'a d'identifiants que sur les bases jetables

Sont jetables : la base de developpement local (`.env`), celle de test (`.env.test`) et celle de preview. Elles ne contiennent que des donnees de travail et des comptes de test, et peuvent etre reconstruites a tout moment par les migrations.

La **production** n'est pas dans cette liste, et ne le sera pas. Un agent ne recoit pas ses identifiants, ni pour une lecture, ni temporairement, ni « juste pour verifier ». Ne pas les demander.

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

`prisma migrate reset` et `prisma db push` sont restreints par liste blanche de hosts, appliquee dans `packages/db/cliDatasource` et declaree par l'environnement. **Liste absente vaut refus** : l'environnement de production n'a aucune raison de porter ces variables, et c'est ce qui le protege par construction. Cette liste est le dernier rempart contre une faute de frappe sur un fichier d'environnement : elle ne s'elargit pas pour faire passer une commande qui bloque.

## Ce que ca ne change pas

Un acte destructeur sur une base jetable reste soumis a l'accord explicite de l'utilisateur, demande juste avant, pour cette operation precise.
