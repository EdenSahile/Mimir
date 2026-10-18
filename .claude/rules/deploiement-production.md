# Deploiement : chaque fusion dans `dev` deploie la production

L'environnement **Production** du projet Vercel suit la branche **`dev`**. L'environnement Preview suit toutes les autres branches. **Il n'y a pas de branche `main`**, et il n'existe aucune etape de promotion apres la fusion : fusionner une PR dans `dev` deploie la production.

Verifie le 2026-10-18 dans Settings → Environments et par l'API Vercel, qui renvoie `productionBranch: dev`. Ne pas ecrire de procedure qui suppose un `main`, ni parler de « promotion » : le mot exact est « fusion ».

## Consequence : les migrations partent AVANT la fusion

La production n'applique pas ses migrations pendant son build (DEC-012) : elle passe par `pnpm db:deploy`, lance par l'utilisateur. Donc **avant toute PR qui apporte une nouvelle migration, `pnpm db:deploy` est lance contre la production AVANT la fusion**. Sans ca, le code arrive sur un schema qu'il ne reconnait pas, et rien ne le migrerait.

**La base est alors en avance sur le code pendant quelques minutes**, le temps de la fusion et du deploiement. C'est acceptable ou non selon la nature de la migration.

- **Migration additive** (nouvelle table, nouvelle colonne nullable, nouvel index) : sans effet, l'ancien code ignore ce qu'il ne connait pas.
- **Migration destructrice** (colonne supprimee ou renommee, contrainte resserree, type change) : l'ancien code lit ou ecrit ce qui vient de disparaitre, et il casse. Elle demande un **decoupage en 2 temps**, 2 PR distinctes : d'abord une migration additive plus un code qui n'utilise plus l'ancienne forme, fusionne et deploye ; puis la migration qui supprime. Jamais les 2 dans la meme fusion.

Le test avant d'ecrire une migration : **est-ce que le code actuellement en production survit a cette migration pendant 5 minutes ?** Si non, elle se decoupe.

## Limite actuelle : cette rule n'a aucune application technique

Rien n'empeche une fusion qui oublie le `pnpm db:deploy`. Le code part alors sur une base en retard et sert des 500. Un ticket ouvert porte le filet manquant : un controle au demarrage de l'API qui compare les migrations enregistrees en base a celles du dossier `prisma/migrations` et refuse de servir si la base est en retard, en tolerant l'avance, qui est le cas normal de cette rule. Tant qu'il n'est pas fait, la regle repose sur la discipline.

## Ce que ca ne change pas

L'accord explicite de l'utilisateur est requis pour chaque fusion (rule `git`). Cette rule dit ce qu'une fusion declenche, elle n'autorise aucune fusion.
