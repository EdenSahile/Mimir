# Smoke tests -- MIM-8 (Construire la navigation)

> Ces scenarios sont ecrits **avant** l'implementation (test-first).
> Ils s'executent **apres**, app lancee dans le navigateur.

## Preconditions generales

- App lancee (`pnpm dev`)
- Navigateur ouvert sur `http://localhost:5173`

---

### NavRail -- responsive a 760px

> **Ce qu'on verifie :** le NavRail apparait et disparait au bon breakpoint. Les classes responsive sont testees en auto, mais le comportement reel a 760px depend de la config Tailwind et du CSS.

**Preconditions**
- Page d'accueil chargee

**Etapes**
1. Ouvrir les DevTools, activer le mode responsive.
2. Reduire la largeur a 759px.
3. Observer la zone gauche de l'ecran.
4. Elargir a 760px.
5. Observer la zone gauche de l'ecran.

**Resultat attendu**
- A 759px : aucun rail de navigation visible sur la gauche.
- A 760px : le NavRail apparait (190px de large, avec le Wordmark et les 8 elements).

- [ ] Passe

---

### NavRail -- trait lumineux sur l'element actif

> **Ce qu'on verifie :** le trait vertical a la bonne taille (1x13px), brille avec `--nav-glow`, et l'element actif est en `--ink-strong`. Les attributs ARIA et la presence de l'indicateur sont couverts en auto.

**Preconditions**
- Viewport >= 760px
- NavRail visible

**Etapes**
1. Observer l'element de navigation correspondant a la page active (ex. "Mimir" si on est sur l'Assistant).
2. Verifier qu'un trait vertical est visible a gauche du texte.
3. Inspecter le trait dans les DevTools : largeur 1px, hauteur 13px.
4. Verifier que le trait a une lueur (glow/shadow).
5. Verifier que le texte actif est plus lumineux que les inactifs.

**Resultat attendu**
- Le trait vertical mesure 1x13px.
- Le trait a une lueur visible (box-shadow ou filter).
- Le texte actif est en `--ink-strong`, les inactifs en opacite .66.

- [ ] Passe

---

### BottomBar -- responsive et animation de respiration

> **Ce qu'on verifie :** la BottomBar apparait sous 760px et MimirPresence respire visuellement. La structure DOM et les classes sont couvertes en auto.

**Preconditions**
- Page d'accueil chargee

**Etapes**
1. Ouvrir les DevTools, activer le mode responsive.
2. Reduire la largeur a 759px.
3. Observer le bas de l'ecran.
4. Verifier que la barre est fixe, a 12px des bords, avec un fond sombre semi-transparent et un flou.
5. Identifier MimirPresence au centre (l'element circulaire de 50px).
6. Observer MimirPresence pendant 5 secondes.

**Resultat attendu**
- La BottomBar est visible en bas, fixe, avec coins arrondis (22px) et fond floute.
- MimirPresence est centre entre les elements de gauche et de droite, fait 50px.
- MimirPresence a une animation de respiration visible (changement cyclique d'opacite ou d'echelle).

- [ ] Passe

---

### AppHeader -- cercle des initiales et horloge responsive

> **Ce qu'on verifie :** le cercle des initiales fait visuellement 30px, et l'horloge mono apparait/disparait au breakpoint 1100px. Les classes sont couvertes en auto.

**Preconditions**
- Viewport >= 760px (desktop)
- Utilisateur connecte (initiales visibles)

**Etapes**
1. Observer l'en-tete, reperer les initiales a droite.
2. Inspecter l'element des initiales dans les DevTools : verifier qu'il mesure 30x30px et est circulaire.
3. Elargir le viewport a >= 1100px.
4. Observer la presence de l'horloge dans l'en-tete (typographie monospace).
5. Reduire le viewport a 1099px.
6. Observer si l'horloge disparait.

**Resultat attendu**
- Les initiales sont dans un cercle de 30x30px.
- A >= 1100px : l'horloge est visible en typographie monospace.
- A < 1100px : l'horloge est masquee.

- [ ] Passe

---

### Transition Assistant / Workspace -- fluidite a 900ms

> **Ce qu'on verifie :** la transition entre les 2 modes est visuellement fluide et dure environ 900ms. Les classes de transition sont couvertes en auto.

**Preconditions**
- Viewport >= 760px (desktop, ModeSwitch visible)
- Mode Assistant actif

**Etapes**
1. Cliquer sur "Workspace" dans le ModeSwitch.
2. Observer la transition du contenu.
3. Cliquer sur "Assistant" pour revenir.
4. Observer la transition.
5. Optionnel : ouvrir l'onglet Performance des DevTools, enregistrer la transition, verifier la duree.

**Resultat attendu**
- La transition est fluide (pas de saccade, pas de saut).
- La duree percue est d'environ 1 seconde (900ms).
- L'easing donne une impression organique (pas lineaire, pas brusque).

- [ ] Passe
