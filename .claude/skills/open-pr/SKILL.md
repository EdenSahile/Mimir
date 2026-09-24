---
name: open-pr
description: Amene le travail termine jusqu'a la Pull Request, sans merger. Lance une code review, passe un verrou de qualite bloquant (lint + typecheck + test), pousse la branche, ouvre la PR vers dev. Utiliser quand l'utilisateur dit "ouvre la PR", "open pr", "envoie en review", "c'est fini, on pousse", "pousse", "push".
---

## Entrée

- La **branche courante**, considérée comme terminée par l'utilisateur : travail commité, pas encore poussé.

## Sortie

- L'**URL de la PR** ouverte vers `dev`.

Le skill s'arrête là. Il ne merge pas, et **ne touche pas au ticket Notion** : le ticket reste en `DOING` et ne passera en `TO TEST` qu'après le merge (via `merge-pr`). La validation fonctionnelle finale (tests manuels, smoke, visuel, responsive, accessibilité) a lieu en `TO TEST`, après le merge. Les tests automatisés, eux, sont un **quality gate avant la PR** : ils doivent passer en vert pour que la PR s'ouvre.

---

## Étapes

1. **Vérifier le point de départ.** `git status` et branche courante. S'il reste des changements non commités, le signaler et demander, ne pas commiter à la place de l'utilisateur.
2. **Code review.** Lancer `/code-review` sur le diff de la branche courante face à `dev`. Si la review remonte des défauts ⛔ (bloquants), s'arrêter et les présenter à l'utilisateur. Les défauts ⚠️ et 💡 sont signalés mais ne bloquent pas.
3. **Passer le verrou.** `pnpm lint`, puis `pnpm typecheck`, puis `pnpm test`.
4. **Pousser.** `git push -u origin <branche>`.
5. **Ouvrir la PR.** `gh pr create --base dev --head <branche>`, titre clair et corps dérivé des commits de la branche. Afficher l'URL.

## Règles

- **Le verrou est bloquant.** Au premier rouge : on s'arrête, on montre la sortie réelle de la commande, et **rien n'est poussé**. Ne jamais contourner un test qui échoue ni le désactiver pour pouvoir pousser.
- **⛔ Ne jamais merger.** Le merge vers `dev` est une décision explicite de l'utilisateur, donnée pour CETTE PR précise (cf. la rule Git du repo). Ouvrir la PR ne vaut pas autorisation.
- **Un seul repo à la fois** : celui de la branche courante. Ne pas pousser ni ouvrir de PR pour un autre repo.
- **Rapporter l'état réel.** Si une étape échoue (push refusé, `gh` non authentifié), le dire franchement avec l'erreur — ne pas prétendre que c'est fait.
