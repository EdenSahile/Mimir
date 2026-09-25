# Tests : strategie de classification

Chaque critere d'acceptation d'un ticket est classe par le `test-planner` en repondant a une seule question : **ce qu'on verifie est-il testable en unitaire / composant ?**

La reponse determine le verdict, et le verdict determine ce qui est produit.

## La question de tri

Pour chaque critere, se demander : **qu'est-ce que je verifie exactement ?**

- **Du code a nous** (une transformation, un calcul, une decision, une validation, un comportement DOM, un changement d'etat, une interaction) → on le teste en auto.
- **Un rendu purement visuel** (couleur exacte, fluidite d'une animation, alignement pixel, ressenti d'une transition) → on le verifie a l'oeil, pas en auto.

Presence d'UI ≠ non-testable. Un composant React qui rend un bouton avec un role, une classe, un etat : c'est testable. La couleur exacte de ce bouton a l'ecran : c'est visuel.

## Les 3 verdicts

### 🟢 Test automatise

Ce qu'on verifie est entierement testable en auto. Le test couvre le critere a 100%.

Exemples : presence d'un element dans le DOM, interaction avec un bouton, changement d'etat, affichage conditionnel, validation de donnees, logique metier pure, roles et attributs ARIA.

Outils : Vitest + Testing Library (composant), Vitest seul (logique pure).

### 🟠 Automatise + verification manuelle

Ce qu'on verifie a 2 tranches distinctes : une testable en auto, une qui necessite un oeil humain. Les 2 tranches doivent etre nommees explicitement dans la strategie.

Le test auto couvre la tranche structurelle. Un smoke test est produit pour la tranche visuelle.

Exemples : un bouton avec un glow (auto : la classe de shadow est presente ; manuel : le glow a la bonne couleur et intensite). Une animation (auto : la classe de transition est appliquee ; manuel : la transition est fluide a l'ecran).

### 🔴 Smoke test manuel

Ce qu'on verifie est purement visuel ou perceptuel. Aucun test auto ne couvre le critere.

Exemples : absence de flash blanc au chargement, fluidite d'une animation, coherence visuelle d'ensemble, rendu typographique.

Un smoke test est produit avec les etapes concretes.

## Regle de decision

Par defaut, un critere est 🟢. Il passe en 🟠 ou 🔴 uniquement si une partie significative de la verification ne peut pas etre automatisee. Ne jamais considerer que « UI = pas de tests ».

## Ce que le tri produit

Le `test-planner` produit **2 fichiers** :

1. **`testing/strategie-MIM-X.md`** : le tableau de suivi avec 3 colonnes : Critere, Type, Fait.
   - **Fait** : `✅` pour les tests auto (toujours faits par Claude), `✅ Auto · ⬜ Smoke` pour les 🟠, `⬜ Smoke` pour les 🔴.
   - Le fichier se termine par une section **A verifier manuellement** qui pointe vers le fichier smokes s'il existe. Si le ticket n'a que des 🟢, la section dit « Rien, tous les criteres sont couverts en auto. »
2. **`testing/smokes-MIM-X.md`** : les scenarios de verification manuelle pour les criteres 🟠 (part manuelle) et 🔴. Chaque scenario decrit : preconditions, etapes, resultat attendu, checkbox.

Si le ticket n'a que des 🟢, le fichier de smokes n'est pas produit.
