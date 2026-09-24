# Tests : strategie de classification

Chaque critere d'acceptation d'un ticket est classe dans une des 3 categories suivantes par le `test-planner`.

## 🟢 Test automatise

Le comportement est verifiable dans le DOM ou en logique pure. Exemples :

- Presence d'un element dans le DOM
- Interaction avec un bouton ou un formulaire
- Navigation entre routes
- Changement d'etat
- Affichage conditionnel
- Validation de donnees
- Logique metier pure

Outils : Vitest + Testing Library (composant), Vitest seul (logique pure).

## 🟠 Test automatise + verification manuelle

Le comportement a une partie verifiable en auto et une partie qui necessite un oeil humain. Exemples :

- Grille CSS avec espacement precis : tester la presence du pattern en auto, verifier visuellement l'alignement
- Animation avec parametres : tester les classes/styles appliques en auto, verifier visuellement le rendu

Le test automatise couvre la structure, la verification manuelle couvre le rendu.

## 🔴 Smoke test manuel

Le comportement est purement visuel ou perceptuel et ne se verifie pas de facon fiable en auto. Exemples :

- Absence de flash blanc au chargement
- Fluidite d'une animation
- Ressenti d'une transition
- Coherence visuelle d'ensemble
- Rendu typographique

Le smoke test decrit : quoi faire, quoi observer, resultat attendu.

## Regle de decision

Par defaut, un critere est 🟢. Il passe en 🟠 ou 🔴 uniquement si une partie significative de la verification ne peut pas etre automatisee. Ne jamais considerer que « UI = pas de tests ».
