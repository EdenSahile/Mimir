---
name: merge-pr
description: Merge la PR de la branche courante vers dev, puis passe le ticket Notion de DOING a TO TEST. Utiliser quand l'utilisateur dit "merge la PR", "merge-pr", "merge cette PR", "on merge".
disable-model-invocation: true
---

## Entrée

- La **PR de la branche courante** (ouverte par `open-pr` vers `dev`), que l'utilisateur veut merger maintenant.
- Le **ticket Notion associé**, déduit du nom de branche (`MIM-\d+`), avec son **statut courant**.

## Sortie

- La **confirmation du merge** avec l'**URL de la PR**.
- Soit la **confirmation que le ticket est passé en `TO TEST`**, soit le **statut trouvé et laissé intact**, quand il est déjà plus avancé.

---

## Base Notion

- **Data Source** : `collection://e26f4069-a2bd-4d19-9229-e3acb517b275`
- **Propriété ID ticket** : `userDefined:ID` (auto-increment numérique, ex. `5` pour MIM-5)
- **Propriété statut** : `Statut`, dont les options sont, dans l'ordre, `TODO`, `DOING`, `TO TEST`, `TO PROD`, `DONE`. L'option cible est `TO TEST`.

## Garde-fou merge (NON négociable)

La rule `rules/git.md` interdit tout merge sans accord explicite **pour cette PR précise**.

L'utilisateur doit explicitement demander le merge dans son message. Les formulations suivantes valent invocation explicite de ce skill et accord ponctuel pour **la PR de la branche courante uniquement** :

- `merge-pr`
- `merge la PR`
- `merge cette PR`
- `on merge`

Règles impératives :

- L'invocation explicite du skill par l'utilisateur vaut accord ponctuel pour **CE merge-là, et lui seul**.
- Ne jamais déclencher ce skill de toi-même.
- Ne jamais enchaîner automatiquement sur une autre PR.
- Une simple mention ou discussion autour d'un merge ne vaut pas autorisation.
- Au moindre doute sur le fait que l'utilisateur veut réellement merger maintenant, demander confirmation avant d'exécuter le merge.

## Étapes

1. **Merger la PR courante.** `gh pr view --json number,url,state` pour la récupérer. Si aucune PR n'est ouverte pour la branche, stop. Sinon `gh pr merge --merge --delete-branch`. Si la PR n'est pas mergeable (conflits, checks rouges), stop et expliquer pourquoi.
2. **Passer le ticket en `TO TEST`, mais seulement s'il est en retard.**
   - Extraire le numéro du ticket depuis le nom de branche : le token `MIM-\d+` (ex. `feat/MIM-5-design-system` → `5`).
   - Charger l'outil Notion via ToolSearch si besoin (`select:mcp__claude_ai_Notion__notion-query-data-sources,mcp__claude_ai_Notion__notion-update-page`).
   - Lire le ticket **et son statut** : `SELECT url, "Statut" FROM "collection://e26f4069-a2bd-4d19-9229-e3acb517b275" WHERE "userDefined:ID" = <numéro>`.
   - **Statut `TODO` ou `DOING`** : mettre à jour `Statut` → `TO TEST` via `update-page`.
   - **Statut `TO TEST`, `TO PROD` ou `DONE`** : ne rien écrire, et nommer le statut trouvé dans la restitution.
   - Si le ticket est introuvable ou ambigu, le dire **sans bloquer** (le merge a réussi).

### Pourquoi le statut se lit avant de s'écrire

Une branche de travaux annexes (rules, docs, outillage) prend souvent le numéro du ticket qui l'a motivée, et ce ticket est fréquemment déjà clos. Écrire `TO TEST` sans regarder ferait donc **reculer** un ticket déjà validé, et cette régression effacerait une décision de l'utilisateur.

Cas réel du 2026-10-29 : la PR #65 portait la branche `chore/MIM-37-mesure-critere-4` alors que MIM-37 était `DONE` depuis sa mesure. L'écriture a été sautée à la main, mais rien dans ce skill ne l'empêchait.

## Restitution

Une ligne. Selon le cas :
```
PR #42 mergée (branche supprimée), ticket MIM-5 en TO TEST
PR #65 mergée (branche supprimée), ticket MIM-37 laissé en DONE
```
Si une étape est sautée (ticket introuvable), le dire sur la même ligne.

## Anti-patterns

- Merger sans que l'utilisateur ait invoqué le skill pour CETTE PR.
- Enchaîner sur une 2e PR dans la foulée.
- Forcer un merge sur une PR avec conflits ou checks rouges.
- Passer le ticket en `DONE` : il va en `TO TEST`, rien n'est validé.
- **Faire reculer un ticket** : écrire `TO TEST` sur un ticket déjà en `TO TEST`, `TO PROD` ou `DONE`.
- Bloquer la fusion parce que le statut du ticket interdit l'écriture : la fusion a lieu d'abord, le ticket ensuite.
- Bloquer toute la commande si le ticket est introuvable : le merge prime.
