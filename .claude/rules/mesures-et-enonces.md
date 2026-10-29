# Une mesure qui contredit un enonce corrige cet enonce dans la meme passe

## Regle zero : la regle qu'on vient d'ecrire s'applique d'abord a la phrase qu'on vient d'ecrire

Elle est en tete parce qu'elle **gouverne l'application de toutes les autres**, et qu'une regle lue en dernier ne gouverne rien.

**Le controle** : avant de rendre un texte qui enonce une regle, relire **ce meme texte** a travers elle. Le point aveugle n'est pas l'ecrit ancien, c'est la phrase que l'on vient de taper : on la croit conforme du fait de l'avoir ecrite en connaissant la regle.

Cas reel du 2026-10-29 : la ligne « cout de la fuite : probablement nul » a ete ecrite dans `docs/incidents.md` **dans la meme passe** que la regle interdisant de presenter un enonce non mesure comme mesure. **Rattrapee par l'utilisateur, pas par l'agent**, et les 2 textes etaient dans le meme commit.

## L'obligation principale

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

## Un code de statut n'est pas un diagnostic

**On lit le corps de la reponse et les logs avant de conclure sur une cause.** Un code de statut dit qu'une requete a echoue ; il ne dit ni ou, ni pourquoi, ni meme quel composant a repondu.

Le controle, avant d'ecrire une cause :

- **le corps de la reponse a ete lu**, pas seulement son code ;
- **les logs d'execution ont ete lus**, et le compte rendu cite l'erreur reelle ;
- si la cause est annoncee sans log, le compte rendu dit qu'elle est **deduite** et de quoi.

2 cas nommes de ce chantier, a reconnaitre quand ils se reproduisent. **La procedure executable vit dans le runbook de `deploiement-production`, section « Les 3 pieges, tous rencontres » ; elle n'est pas recopiee ici.**

- **Le `401` du mur de protection.** Le code venait de l'infrastructure d'hebergement, avant que la requete n'atteigne l'application. Il etait **identique** a celui attendu en cas de succes, donc le resultat paraissait conforme. Seul le corps de la reponse distinguait les 2.
- **L'echec d'authentification du driver de base.** Un `500` sur une route d'authentification est compatible avec au moins 4 causes : identifiants perimes, base suspendue ou branche supprimee, schema non migre, configuration d'authentification cassee. Le code n'en elimine aucune. **Le log les a toutes tranchees en une lecture**, par l'erreur du pilote et par une pile d'appels qui mettait les 3 autres hypotheses hors de cause.

La lecon de cout : 10 jours de panne ont ete diagnostiques a partir d'un code de statut, et le log a donne la reponse en une minute le jour ou il a enfin ete lu.

## Interdiction du mecanisme qui explique tout

Une cause qui explique elegamment tous les symptomes est **suspecte**, pas confirmee : c'est aussi la forme que prend une hypothese seduisante qu'on n'a pas testee.

Avant d'adopter une cause unique, **2 productions sont dues**, et leur absence vaut refus :

1. **Ce que la cause n'explique pas.** Chercher explicitement, et l'ecrire. S'il n'y a rien, le dire aussi, et c'est alors un resultat.
2. **Au moins une hypothese concurrente**, avec **l'observation qui l'eliminerait**. Une hypothese concurrente sans son test de refutation ne compte pas : elle decore.

Et quand les mesures ne tranchent pas, **ne pas combler le trou par une explication**. Ecrire que la contradiction n'est pas resolue, et produire un **protocole falsifiable** : l'observation a faire, et ce que chaque resultat conclurait. La rule `deploiement-production` en contient un exemple execute, section « Le protocole de resolution, a executer a la prochaine fusion ».

## La synthese est soumise a la meme exigence que le detail

**La synthese qui arrondit** est la forme la plus discrete du defaut : un corps d'analyse juste, annonce par une ligne de tete qui ecrase la nuance. Le corps est exact, personne ne le relit, et c'est la ligne de tete qui reste.

Cas reel du 2026-10-29 : un inventaire detaillant « 1 complete, 1 couverte en partie, 2 absentes » a ete annonce par « 2 existent deja, 2 manquent ». La nuance perdue, « couverte en partie », etait precisement celle qui portait le travail delicat, puisqu'elle imposait un deplacement sans duplication.

**Le controle** : une synthese se relit six mois plus tard comme un fait. Elle porte donc la meme exigence de provenance que le detail, et un arrondi qui supprime une categorie en est une alteration, pas un raccourci.

## Ne pas se reecrire en faute sur le mauvais point

Corollaire du precedent, et du meme jour. En decouvrant `true`, le compte rendu a annonce « je me suis trompe sur la valeur ». C'etait faux : la valeur d'origine etait peut-etre juste, et elle est indeterminable. **La faute etait de presenter un fait non mesure comme mesure**, pas d'avoir donne la mauvaise valeur.

Une excuse qui porte sur le mauvais point n'est pas une excuse, c'est une seconde erreur : elle enterre le vrai defaut de methode sous un faux aveu, et le defaut se reproduit. Nommer precisement ce qui a ete mal fait fait partie de la correction.

## Quand la correction depasse la passe en cours

Un enonce faux dont la correction demande un vrai chantier (une spec a reecrire, une decision a reprendre) sort en ticket. Alors 2 choses sont dues, pas une : **le ticket**, et une **marque sur l'enonce lui-meme** qui dit qu'il est contredit, ce qui a ete mesure, et vers quel ticket aller. Un ticket seul ne protege pas le prochain lecteur de l'enonce, puisqu'il ne le lira pas.

## Ce que ca ne change pas

Les statuts Notion et le contenu des tickets restent la decision de l'utilisateur (rule `ordre-des-tickets`). Cette rule impose de **signaler et de corriger l'ecrit technique** contredit par une mesure, elle n'autorise pas a requalifier un ticket, a le fermer, ni a changer son statut.

C'est le pendant de la rule de methode de `deploiement-production` : celle-la dit qu'une verification doit porter sur la chose elle-meme, celle-ci dit ce qu'on fait du resultat quand il contredit l'ecrit.
