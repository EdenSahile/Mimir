# Bases de donnees : identifiants et actes d'exploitation

Les bases de ce projet ne se valent pas. Les identifiants qu'un agent detient, et ce qu'il a le droit d'en faire, suivent cette distinction.

## Un agent n'a d'identifiants que sur `dev` et `test`

Ces 2 bases sont jetables : la base de developpement local (`.env`) et celle de test (`.env.test`). Elles ne contiennent que des donnees de travail et des comptes de test, et peuvent etre reconstruites a tout moment par les migrations.

**La production et la preview vivent uniquement cote Vercel**, qui injecte leurs identifiants dans ses propres builds et ses propres fonctions. Un agent ne recoit pas ces identifiants, ni pour une lecture, ni temporairement, ni « juste pour verifier ». Ne pas les demander.

La preview a quitte la liste des bases dont l'agent detient les identifiants le 2026-10-18 : sa branche Neon est creee comme enfant d'une production deja saine, donc elle nait avec un historique de migrations propre et aucune ligne. Il n'y a plus de `migrate reset` a lancer dessus, donc plus aucune raison d'en detenir les identifiants.

## Un identifiant colle dans une conversation est un identifiant a faire tourner

Sans evaluer la probabilite qu'il ait ete lu ni la duree de l'exposition : la rotation est le geste par defaut, immediat. Elle reste moins couteuse que l'enquete qui essaierait de l'eviter.

**Corrige le 2026-10-29 : cette rule affirmait que la rotation est « bon marche ». C'est faux.** La rotation du 2026-10-19 a casse la production pendant **10 jours**. Ce qui est bon marche, c'est le geste chez le fournisseur ; ce qui coute, c'est la sequence qui doit suivre, et qu'on croit terminee avant qu'elle le soit. Rotater reste le bon reflexe, mais **une rotation s'ouvre comme une operation en 5 etapes**, pas comme un clic, et elle ne se lance pas sans aller jusqu'au controle de sortie. Le detail est dans `docs/incidents.md`.

**Les roles Neon sont par branche, pas par projet.** Une rotation ne s'applique qu'a la branche sur laquelle elle est lancee, et une branche creee avant la rotation garde l'ancien mot de passe. Traiter chaque branche separement, et faire tourner avant de creer une branche enfant.

## Rotation d'un mot de passe de base : le runbook vit ailleurs

**La sequence complete est le runbook de `deploiement-production`**, section « toute rotation de secret casse la production si elle s'arrete au fournisseur ». Elle n'est pas recopiee ici : 2 definitions de la meme sequence divergeraient a la premiere etape ajoutee, et c'est deja arrive sur ce chantier.

Ce qui est propre aux bases, et qui reste ici : **les roles Neon sont par branche**, donc une rotation ne touche qu'une branche, et il faut remplacer `DATABASE_URL` **et** `DIRECT_URL`, la poolee et la directe. En oublier une donne la meme panne qu'en oublier le redeploiement.

Ce qu'il faut retenir sans ouvrir l'autre fichier : **une rotation ne se termine ni dans la console du fournisseur, ni a l'ecriture de la variable sur Vercel.** Elle se termine quand le domaine sert un deploiement construit apres l'ecriture, et que la connexion bidon rend `401` et non `500`.

## Ne jamais demander la valeur d'un secret

**Un agent travaille a partir du nom d'un secret, jamais de sa valeur.** Il ne la demande pas, ne la suggere pas, ne propose aucun contournement pour l'obtenir.

Ce n'est pas une precaution theorique : `vercel env ls production` n'affiche que les **noms** et les **dates**, et le 2026-10-29 cette seule information a suffi a dater la rotation, identifier le deploiement fautif et conclure le diagnostic. La valeur n'a servi a rien a aucun moment.

**Si l'utilisateur donne quand meme une valeur**, 2 obligations, dans cet ordre :

1. **Le signaler**, immediatement et explicitement, parce que la valeur est desormais a faire tourner.
2. **Ne pas l'utiliser.** Ni pour un test, ni pour une lecture, ni « puisqu'elle est deja la ». L'employer transformerait une fuite en dependance, et rendrait la rotation plus couteuse qu'elle ne l'est.

Le cout reel se lit dans l'incident du 2026-10-18 au 29, consigne dans `docs/incidents.md` : un mot de passe colle dans une conversation, impact probablement nul, mais **10 jours de production cassee** causes par la rotation de precaution. Le secret non transmis est donc le seul geste vraiment bon marche. Une fois transmis, meme sans aucune exposition publique, sa remediation coute plus que la fuite.

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

## Comptes de test en production : une mesure deliberee, supprimee dans la meme session

**Pas d'inscription de test en production, sauf une mesure deliberee dont la suppression est executee dans la meme session et consignee dans le ticket.**

Formulation du 2026-10-19, qui remplace l'interdiction seche ecrite dans la spec de MIM-37. Motif du changement : les 11 comptes trouves dans la base de production venaient de **tests repetes non suivis**, pas d'une mesure unique. Une regle qui interdit la seule verification possible de ce qu'elle protege est mal formulee.

Les 3 conditions sont cumulatives, et l'absence d'une seule fait tomber l'autorisation.

- **Deliberee** : elle repond a une question precise qu'aucune sonde en lecture ne ferme. Les sondes se tentent d'abord, et leur echec se montre.
- **Supprimee dans la meme session** : **la suppression est executee par le detenteur des identifiants**, et la commande lui est fournie prete a coller **avant** la creation du compte, pas apres. Formule ainsi parce que « l'utilisateur la lance » decrit une circonstance, pas une exigence : le jour ou un agent detiendrait des identifiants de production, la protection tomberait sans que la regle ait change.
- **Consignee dans le ticket** : l'adresse utilisee, la date, ce qui a ete mesure, et la confirmation de la suppression.

Un compte de mesure n'est jamais reutilise d'une session a l'autre : il n'existe pas de « compte de test de production » permanent, sinon c'est un compte de production comme un autre, avec un mot de passe qui vieillit.

## Ce que ca ne change pas

Un acte destructeur sur une base jetable reste soumis a l'accord explicite de l'utilisateur, demande juste avant, pour cette operation precise.
