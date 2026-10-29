# Une mesure qui contredit un enonce corrige cet enonce dans la meme passe

**Quand une mesure contredit un enonce ecrit ailleurs, cet enonce est corrige dans la meme passe, et la correction est listee dans le rapport.**

« Ailleurs » veut dire partout : un autre ticket Notion, une rule, une spec de `docs/specs/`, `CLAUDE.md`, un commentaire de code, un handoff. L'endroit ne change rien a l'obligation.

## Pourquoi

Une mesure vit le temps d'une session. Un enonce ecrit reste, et il est lu par la session suivante comme s'il etait vrai. Laisser les 2 coexister ne produit pas une incertitude, ca produit une **regression** : la mesure est oubliee, l'enonce est applique, et le travail repart sur le faux.

Le cout est mesure sur ce chantier. La rule `deploiement-production` affirmait que fusionner une PR dans `dev` deploie la production. La mesure du 2026-10-29 a montre que `autoAssignCustomDomains` est a `false` sur le projet Vercel, donc qu'un nouveau deploiement de production **ne prend pas le domaine** : l'alias est reste epingle sur un deploiement du 2026-10-18, et 7 deploiements de production posterieurs n'ont servi aucun trafic. L'enonce est reste faux **10 jours** apres avoir ete contredit, et pendant ces 10 jours il a servi a conclure que la production etait a jour.

## Les 2 obligations sont cumulatives

**Corriger l'enonce.** Pas le commenter, pas l'annoter « a verifier », pas ouvrir un ticket pour plus tard quand la correction tient en une phrase. L'enonce faux est remplace par ce qui a ete mesure, avec la date de la mesure, comme le font deja les rules de ce dossier.

**Lister la correction dans le rapport.** Le compte rendu de la mesure nomme chaque enonce touche et ce qui a change. Sans cette liste, la correction est invisible : l'utilisateur ne peut ni la relire, ni la contester, ni savoir qu'un ticket qu'il croyait stable a bouge.

## Cas reels, tous mesures

- **MIM-1** : un critere d'acceptation nomme la route `/health`. La route reelle est `/api/health`. Le critere etait perime, pas faux a l'origine.
- **MIM-2** : le ticket annonce 14 modeles de donnees. Le schema Prisma en contient 19.
- **MIM-10** : un critere repose sur la classe `font-display`. Mesure : le bloc `@theme` de `index.css` ne declare aucun `--font-display`, donc Tailwind ne genere aucune regle et la classe est inerte. Le critere etait tenu sur le papier et sur rien d'autre.

## Quand la correction depasse la passe en cours

Un enonce faux dont la correction demande un vrai chantier (une spec a reecrire, une decision a reprendre) sort en ticket. Alors 2 choses sont dues, pas une : **le ticket**, et une **marque sur l'enonce lui-meme** qui dit qu'il est contredit, ce qui a ete mesure, et vers quel ticket aller. Un ticket seul ne protege pas le prochain lecteur de l'enonce, puisqu'il ne le lira pas.

## Ce que ca ne change pas

Les statuts Notion et le contenu des tickets restent la decision de l'utilisateur (rule `ordre-des-tickets`). Cette rule impose de **signaler et de corriger l'ecrit technique** contredit par une mesure, elle n'autorise pas a requalifier un ticket, a le fermer, ni a changer son statut.

C'est le pendant de la rule de methode de `deploiement-production` : celle-la dit qu'une verification doit porter sur la chose elle-meme, celle-ci dit ce qu'on fait du resultat quand il contredit l'ecrit.
