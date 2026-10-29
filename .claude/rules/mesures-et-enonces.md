# Une mesure qui contredit un enonce corrige cet enonce dans la meme passe

**Quand une mesure contredit un enonce ecrit ailleurs, cet enonce est corrige dans la meme passe, et la correction est listee dans le rapport.**

« Ailleurs » veut dire partout : un autre ticket Notion, une rule, une spec de `docs/specs/`, `CLAUDE.md`, un commentaire de code, un handoff. L'endroit ne change rien a l'obligation.

## Pourquoi

Une mesure vit le temps d'une session. Un enonce ecrit reste, et il est lu par la session suivante comme s'il etait vrai. Laisser les 2 coexister ne produit pas une incertitude, ca produit une **regression** : la mesure est oubliee, l'enonce est applique, et le travail repart sur le faux.

Le cout est mesure sur ce chantier. La rule `deploiement-production` affirmait que fusionner une PR dans `dev` deploie la production. Mesure du 2026-10-29 : `mimir-navy.vercel.app` servait un deploiement du 2026-10-18 12:43 CEST, et **15 deploiements de production posterieurs**, tous `READY`, ne servaient aucun trafic. L'enonce est donc reste faux **11 jours**, et pendant ces 11 jours il a servi a conclure que la production etait a jour.

Ne pas confondre les 2 durees de cet incident, elles ne mesurent pas la meme chose : **11 jours** d'epinglage du domaine, du 2026-10-18 au 2026-10-29, et **10 jours** de panne d'authentification, du 2026-10-19, date de la rotation des identifiants, au 2026-10-29. Le detail est dans `docs/incidents.md`.

## Les 2 obligations sont cumulatives

**Corriger l'enonce.** Pas le commenter, pas l'annoter « a verifier », pas ouvrir un ticket pour plus tard quand la correction tient en une phrase. L'enonce faux est remplace par ce qui a ete mesure, avec la date de la mesure, comme le font deja les rules de ce dossier.

**Lister la correction dans le rapport.** Le compte rendu de la mesure nomme chaque enonce touche et ce qui a change. Sans cette liste, la correction est invisible : l'utilisateur ne peut ni la relire, ni la contester, ni savoir qu'un ticket qu'il croyait stable a bouge.

## Cas reels, tous mesures

- **MIM-1** : un critere d'acceptation nomme la route `/health`. La route reelle est `/api/health`. Le critere etait perime, pas faux a l'origine.
- **MIM-2** : le ticket annonce 14 modeles de donnees. Le schema Prisma en contient 19.
- **MIM-10** : un critere repose sur la classe `font-display`. Mesure : le bloc `@theme` de `index.css` ne declare aucun `--font-display`, donc Tailwind ne genere aucune regle et la classe est inerte. Le critere etait tenu sur le papier et sur rien d'autre.

## Mesurer apres avoir mute ne mesure pas l'etat d'avant

**Les reglages se lisent avant d'agir, pas apres.** Une mesure prise apres une action decrit l'etat que cette action a laisse. Elle ne dit rien de l'etat qui a produit le probleme, et elle ne peut plus etre refaite : l'agent a detruit sa propre preuve.

Cas reel du 2026-10-29. Diagnostic d'une panne de production : `vercel promote` lance d'abord, puis lecture de `autoAssignCustomDomains`, qui rend `true`. Conclusion ecrite : « le reglage vaut `true`, mon affirmation precedente etait fausse ». Or [vercel/vercel#15095](https://github.com/vercel/vercel/issues/15095) rapporte que `vercel promote` **remet ce champ a `true` a chaque appel**. La lecture decrivait donc l'etat d'apres mutation. La valeur reelle pendant les 11 jours d'epinglage du domaine est **inconnue, et le restera**, parce que l'ordre des 2 gestes etait inverse.

La regle pratique : **avant toute action qui modifie un etat, lire et consigner les reglages qui entrent dans le diagnostic.** Un diagnostic coute une lecture ; une lecture manquee coute la cause.

Et quand l'ordre a deja ete inverse : ne pas presenter la mesure d'apres comme la valeur d'avant. Ecrire les 3 choses, la valeur lue, le fait qu'elle a ete lue apres telle action, et que la valeur anterieure est inconnue.

## Ne pas se reecrire en faute sur le mauvais point

Corollaire du precedent, et du meme jour. En decouvrant `true`, le compte rendu a annonce « je me suis trompe sur la valeur ». C'etait faux : la valeur d'origine etait peut-etre juste, et elle est indeterminable. **La faute etait de presenter un fait non mesure comme mesure**, pas d'avoir donne la mauvaise valeur.

Une excuse qui porte sur le mauvais point n'est pas une excuse, c'est une seconde erreur : elle enterre le vrai defaut de methode sous un faux aveu, et le defaut se reproduit. Nommer precisement ce qui a ete mal fait fait partie de la correction.

## Quand la correction depasse la passe en cours

Un enonce faux dont la correction demande un vrai chantier (une spec a reecrire, une decision a reprendre) sort en ticket. Alors 2 choses sont dues, pas une : **le ticket**, et une **marque sur l'enonce lui-meme** qui dit qu'il est contredit, ce qui a ete mesure, et vers quel ticket aller. Un ticket seul ne protege pas le prochain lecteur de l'enonce, puisqu'il ne le lira pas.

## Ce que ca ne change pas

Les statuts Notion et le contenu des tickets restent la decision de l'utilisateur (rule `ordre-des-tickets`). Cette rule impose de **signaler et de corriger l'ecrit technique** contredit par une mesure, elle n'autorise pas a requalifier un ticket, a le fermer, ni a changer son statut.

C'est le pendant de la rule de methode de `deploiement-production` : celle-la dit qu'une verification doit porter sur la chose elle-meme, celle-ci dit ce qu'on fait du resultat quand il contredit l'ecrit.
