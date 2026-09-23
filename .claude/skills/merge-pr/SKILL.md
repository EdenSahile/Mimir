---
name: merge-pr
description: Merge la PR de la branche courante vers dev, puis passe le ticket Notion de DOING a TO TEST. Utiliser quand l'utilisateur dit "merge la PR", "merge-pr", "merge cette PR", "on merge".
---

## Entrée

- La **PR de la branche courante** (ouverte par `open-pr` vers `dev`), que l'utilisateur veut merger maintenant.
- Le **ticket Notion associé**, déduit du nom de branche (`MIM-\d+`), à passer en `TO TEST`.

## Sortie

- La **confirmation du merge** avec l'**URL de la PR**.
- La **confirmation que le ticket est passé en `TO TEST`**.

---

## Base Notion

- **Data Source** : `collection://e26f4069-a2bd-4d19-9229-e3acb517b275`
- **Propriété ID ticket** : `userDefined:ID` (auto-increment numérique, ex. `5` pour MIM-5)
- **Propriété statut** : `Statut` → option cible `TO TEST`

## Garde-fou merge (NON négociable)

La rule `rules/git.md` interdit tout merge sans accord explicite **pour cette PR précise**.

- **L'invocation de ce skill PAR L'UTILISATEUR vaut accord ponctuel pour CE merge-là, et lui seul.**
- Ne jamais déclencher ce skill de toi-même, ni l'enchaîner sur plusieurs PR.
- Au moindre doute sur le fait que l'utilisateur veut merger maintenant : demander avant.

## Étapes

1. **Merger la PR courante.** `gh pr view --json number,url,state` pour la récupérer. Si aucune PR n'est ouverte pour la branche, stop. Sinon `gh pr merge --merge --delete-branch`. Si la PR n'est pas mergeable (conflits, checks rouges), stop et expliquer pourquoi.
2. **Passer le ticket en `TO TEST`.**
   - Extraire le numéro du ticket depuis le nom de branche : le token `MIM-\d+` (ex. `feat/MIM-5-design-system` → `5`).
   - Charger l'outil Notion via ToolSearch si besoin (`select:mcp__claude_ai_Notion__notion-query-data-sources,mcp__claude_ai_Notion__notion-update-page`).
   - Chercher le ticket : `SELECT url FROM "collection://e26f4069-a2bd-4d19-9229-e3acb517b275" WHERE "userDefined:ID" = <numéro>`.
   - Mettre à jour `Statut` → `TO TEST` via `update-page`.
   - Si le ticket est introuvable ou ambigu, le dire **sans bloquer** (le merge a réussi).

## Restitution

Une ligne. Ex :
```
PR #42 mergée (branche supprimée) — ticket MIM-5 en TO TEST
```
Si une étape est sautée (ticket introuvable), le dire sur la même ligne.

## Anti-patterns

- Merger sans que l'utilisateur ait invoqué le skill pour CETTE PR.
- Enchaîner sur une 2e PR dans la foulée.
- Forcer un merge sur une PR avec conflits ou checks rouges.
- Passer le ticket en `DONE` : il va en `TO TEST`, rien n'est validé.
- Bloquer toute la commande si le ticket est introuvable : le merge prime.
