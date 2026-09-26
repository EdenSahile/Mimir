---
name: handoff
description: Genere un fichier de passation pour transmettre le contexte a la prochaine session Claude Code
---

## Entrée

- La **session en cours** : ce qui y a été tenté, fait, appris, et ce qui reste à faire.
- Le **repo courant** et son état git.

## Sortie

- Un fichier `handoffs/YYYY-MM-DD-HHMM-handoff.md`, portant les **6 sections imposées** ci-dessous, dans cet ordre et avec ces titres exacts.

---

Génère un fichier de passation pour cette session et sauvegarde-le dans `handoffs/YYYY-MM-DD-HHMM-handoff.md` (date et heure actuelles). Chaque session produit un nouveau fichier, ne jamais écraser un handoff existant. Le tri alphabétique du dossier donne l'ordre chronologique.

## Structure imposée — titres EXACTS, à recopier mot pour mot

Le fichier doit contenir ces sections, dans cet ordre, avec ces titres `##` **à l'identique**, ne jamais les reformuler, traduire, enrichir ni en inventer d'autres :

```
## Prochaines étapes

---

## Ticket actif
## Objectif
## Tentatives échouées
## Tentatives réussies
## Enseignements
```

**Un `---` sépare « Prochaines étapes » du reste**, comme dans un skill où il sépare le contrat du « comment ». Au-dessus, ce qu'il y a à faire. En dessous, le contexte qui permet de le faire.

Contenu attendu de chaque section :

- **## Prochaines étapes** : exactement ce que la prochaine session devra faire, dans l'ordre. **En tête du fichier, volontairement** : c'est la première chose qu'on lit en ouvrant une passation, pour juger d'un coup d'œil si elle a compris ce qu'il y avait à faire. Tout le reste est le contexte qui permet de l'exécuter. **Son contenu s'écrit en citation** (chaque ligne préfixée de `> `), et un `---` la sépare de la suite du fichier.
- **## Ticket actif** : ID et titre du ticket en cours de traitement, sous forme de bullet points (un par information)
- **## Objectif** : ce que cette session cherchait à accomplir, sous forme de bullet points (un par information)
- **## Tentatives échouées** : approches tentées **pour atteindre l'objectif** qui n'ont pas marché, et que la prochaine session doit éviter de refaire (le cas échéant). **Exclure** les pépins d'outillage/environnement sans rapport avec le travail et contournés trivialement : erreur de quoting shell, apostrophes qui cassent une commande, coquille de chemin, commande à relancer. Ce ne sont pas des tentatives échouées, c'est du bruit. Le test : « est-ce que ça change ce que la prochaine session va tenter ou éviter sur le fond ? » Si non, ne pas l'inclure.
- Quand il n'y a aucune tentative échouée à retenir, écrire **un seul bullet : `- Aucune.`** et rien d'autre. Pas de parenthèse expliquant ce qui a été exclu ou contourné, pas de « aucune sur le fond, mais… ». L'absence se note en un mot, point.
- **## Tentatives réussies** : liste concrète des changements effectués (fichiers créés, modifiés, supprimés). Un bullet par changement (ou par commit) : une phrase qui **décrit le changement pour un lecteur**, PAS le libellé brut du commit collé tel quel, et **jamais le hash** (bruit visuel inutile).
- **## Enseignements** : ce qu'on **sait maintenant et qu'on ne savait pas avant**, et qui changerait la façon de travailler la prochaine fois. C'est du savoir, pas un journal d'actions. **N'écrire un enseignement que s'il apporte une vraie plus-value** : quelque chose qu'une session future utiliserait réellement. Ne jamais se forcer à en produire pour remplir la section, un enseignement banal, évident ou déductible du code est pire que rien, c'est du bruit. Mieux vaut zéro enseignement qu'un enseignement nul. Si aucun ne vaut la peine, écrire **un seul bullet : `- Aucun.`** et rien d'autre. Quand il y en a, y entrent typiquement :
  - **Où se trouve réellement la source de vérité** d'une information.
  - **Une décision et son POURQUOI**, surtout quand le pourquoi n'est pas déductible du code.
  - **Une croyance fausse qui a été corrigée**, l'écrire noir sur blanc, pour qu'une session future ne la reforme pas.

  Trois règles pour cette section :
  1. **Séparer le su du déduit.** Ce qui est vérifié (avec sa source : fichier, doc) vs ce qui est une inférence, marquer l'inférence comme telle. Ne jamais présenter une déduction comme un fait sourcé.
  2. **Un enseignement n'est pas une action.** S'il décrit ce qui a été fait, il va dans « Tentatives réussies ». S'il décrit ce qu'il faut faire, il va dans « Prochaines étapes ».
  3. **Le handoff n'est pas le domicile durable d'un enseignement.** Un handoff est lu une fois puis périme. Si l'enseignement est une contrainte de projet qui doit survivre, il faut **aussi** l'écrire à sa vraie place (une doc technique, une rule `.claude/rules/`) et le handoff s'y réfère. Le noter ici seulement, c'est le perdre.

Aucune section supplémentaire (pas de « Décisions clés », « Points de vigilance », « État actuel », etc.). Si une info est utile, elle entre dans une des six sections ci-dessus, sinon elle n'a pas sa place dans le handoff. Le titre `#` de tête (`# Handoff — DATE — ID`) reste libre.

## Règles

- **Vaut pour TOUTES les sections** : chaque bullet est une **phrase courte, claire et rédigée** qui a du sens pour un lecteur, jamais un libellé collé, un fragment brut, ni un paragraphe dense.
- Être précis et concret, pas de résumés vagues
- Inclure les chemins de fichiers lorsqu'on fait référence à des fichiers
- Inclure les IDs et noms des tickets du board Notion
- La prochaine session Claude doit pouvoir lire ce fichier et continuer sans aucun contexte supplémentaire de la part de l'utilisateur
- Ne PAS inclure de contexte personnel ni quoi que ce soit qui ne serve pas à la prochaine session : une passation ne contient que le contexte projet

## Après l'écriture du fichier

1. **Si on est sur une branche de travail** (pas `dev`/`main`) : commiter le handoff sur cette branche.
2. **Si on est sur `dev`** : créer une branche `chore/handoff-YYYY-MM-DD`, commiter, pusher et ouvrir la PR vers `dev`.
