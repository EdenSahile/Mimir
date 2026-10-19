# Ordre des tickets : on suit les numeros, la priorite fait remonter

Les tickets du Backlog Mimir se traitent **dans l'ordre de leurs numeros**, MIM-1, MIM-2, MIM-3. C'est l'ordre par defaut, et il n'a pas a etre justifie.

Les priorites **P0 a P3** ne sont pas une seconde file d'attente : elles servent a **faire remonter** ce qui doit passer avant son rang. Un P0 passe devant, un P3 attend qu'il ne reste rien de plus urgent, mais a urgence egale, c'est le numero qui tranche.

## Ce que ca interdit

- Choisir un ticket parce qu'il est petit, interessant, ou dans le fichier qu'on vient d'ouvrir.
- Proposer un ticket de rang eleve sans dire qu'il sort de l'ordre, et pourquoi.
- Deduire un ordre d'une liste ecrite ailleurs, par exemple une liste de « prochaines etapes » dans un handoff : elle rappelle le contexte, elle ne reclasse pas le backlog.

## Travailler hors sequence se demande, et se note

MIM-37 a ete traite hors sequence a titre **exceptionnel**, parce que rien ne pouvait etre valide en production tant que le backend n'y tournait pas. C'est le modele du cas legitime : un ticket qui bloque la verification de tous les autres.

Un agent ne decide pas d'un hors sequence. Il le **propose** avec son motif, et attend l'accord.

## Un ID de ticket s'obtient depuis Notion, il ne s'invente pas

Le champ `ID` du Backlog Mimir est un **auto-increment en lecture seule** : Notion l'attribue a la creation, et personne ne le choisit. Donc **creer le ticket d'abord, lire l'ID attribue, nommer la branche ensuite**. La rule `branches-et-commits` exige un `MIM-<N>` reel, et un numero qui ne designe aucun ticket n'en est pas un.

Cas reels du 2026-10-18 : les branches `MIM-100`, `MIM-101`, `MIM-102` et `MIM-103` ont ete nommees d'apres une convention « au-dela de 100 pour les taches sans ticket » qui n'existait que dans les noms de branches. Aucun de ces numeros n'a jamais existe dans Notion, ou le dernier ticket etait MIM-39. Une PR a ete ouverte et fusionnee sous le nom `fix/MIM-103-mjs-entrypoint`, qui ne designe rien.

C'est la meme famille d'erreur que l'identite d'une base verifiee a la source (rule `bases-et-identifiants`) : **un nom plausible n'est pas une verification.** Notion pour un ID de ticket, la console du fournisseur pour une base, le paquet de fonction pour un empaquetage (rule `deploiement-production`).

## Ce que ca ne change pas

L'accord de l'utilisateur reste requis pour commencer un ticket, et les statuts Notion restent sa decision (rules `git` et `branches-et-commits`).
