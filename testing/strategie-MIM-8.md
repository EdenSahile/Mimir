## Strategie de test -- MIM-8 (Construire la navigation)

| Critere | Ce qu'on verifie | Testable auto ? | Pourquoi | Comment |
|---|---|---|---|---|
| NavRail visible >= 760px, masque en dessous | Les classes CSS responsive sont appliquees (masque sous le breakpoint, visible au-dessus) | 🟠 | Auto : les classes responsive (type `hidden`/`flex`) sont dans le DOM. Manuel : le breakpoint custom 760px fonctionne reellement dans le navigateur | Auto (classes) + smoke manuel (resize a 760px) |
| NavRail : element actif avec `aria-current="page"`, trait lumineux 1x13px | L'attribut `aria-current="page"` est present sur l'element actif, et l'indicateur (element ou pseudo-element) est dans le DOM avec sa classe | 🟠 | Auto : `aria-current="page"` est un attribut DOM testable, presence de l'element indicateur verifiable. Manuel : le trait a la bonne taille (1x13px), la lueur (`--nav-glow`) et la couleur (`--light`) | Auto (aria + indicateur) + smoke manuel (rendu du trait) |
| BottomBar visible < 760px avec MimirPresence au centre (50px, respiration) | La BottomBar rend ses 5 elements, MimirPresence est present avec la classe de taille 50px et la classe d'animation de respiration | 🟠 | Auto : structure du DOM (5 elements, MimirPresence present, classe de taille, classe d'animation). Manuel : la BottomBar apparait sous 760px, la respiration est visuellement fluide | Auto (structure + classes) + smoke manuel (responsive + animation) |
| MoreSheet : s'ouvre au tap sur "Plus", fond scrim, fermeture au tap exterieur | Clic sur "Plus" fait apparaitre la sheet dans le DOM, un element scrim est present, clic sur le scrim ferme la sheet | 🟢 | Tout est de l'interaction DOM : ouverture, presence du scrim, fermeture au clic exterieur | Test composant (Testing Library) |
| ModeSwitch : bascule Assistant/Workspace | Clic sur un segment change l'etat actif du composant | 🟢 | Changement d'etat et attribut actif, testable en composant | Test composant (Testing Library) |
| AppHeader : initiales dans cercle 30px, horloge mono >= 1100px | L'element des initiales a les classes de taille (30px) et d'arrondi, l'horloge a la classe font-mono et les classes responsive pour >= 1100px | 🟠 | Auto : classes de taille, arrondi, font-mono, classes responsive. Manuel : le cercle rend visuellement a 30px, l'horloge disparait sous 1100px | Auto (classes) + smoke manuel (rendu cercle + responsive horloge) |
| Transition Assistant <-> Workspace : 900ms, `--ease-presence` | Les classes ou styles de transition (duration 900ms, easing `--ease-presence`) sont appliques lors de la bascule | 🟠 | Auto : la classe/style de transition est presente apres bascule. Manuel : la transition est visuellement fluide et dure 900ms | Auto (classes/styles) + smoke manuel (fluidite) |
| Wordmark cliquable, retour a l'accueil | Le Wordmark est un lien (ou a un handler) qui navigue vers `/` | 🟢 | Le Wordmark est un `<a>` avec href ou un element cliquable qui declenche la navigation. Le href ou l'appel de navigation est verifiable | Test composant (Testing Library) |
| Navigation au clavier : Tab parcourt rail, en-tete, contenu, composer | La touche Tab deplace le focus dans l'ordre : rail, en-tete, contenu, composer | 🟢 | L'ordre de focus est testable avec `userEvent.tab()` et verification de `document.activeElement` | Test composant (Testing Library + userEvent) |

## Recap

### Automatise (test-writer)

- MoreSheet : ouverture au clic "Plus", presence du scrim, fermeture au clic exterieur
- ModeSwitch : bascule d'etat entre Assistant et Workspace
- Wordmark : lien cliquable vers l'accueil
- Navigation clavier : ordre de focus Tab a travers rail, en-tete, contenu, composer

### Automatise + smoke manuel

- NavRail responsive : auto sur les classes responsive, smoke sur le comportement a 760px
- NavRail element actif : auto sur `aria-current="page"` et presence de l'indicateur, smoke sur le rendu du trait lumineux
- BottomBar + MimirPresence : auto sur la structure DOM et les classes, smoke sur la responsive et l'animation de respiration
- AppHeader : auto sur les classes de taille/arrondi/font-mono/responsive, smoke sur le rendu visuel du cercle et la visibilite de l'horloge
- Transition mode : auto sur les classes/styles de transition, smoke sur la fluidite a 900ms

### Smoke manuel

(aucun critere purement manuel)
