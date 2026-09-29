# Smoke tests -- MIM-11 (Construire Onboarding)

> Ces scenarios sont ecrits **avant** l'implementation (test-first).
> Ils s'executent **apres**, app lancee dans le navigateur.

## Preconditions generales

- App lancee (`pnpm dev`)
- Navigateur ouvert sur `http://localhost:5173/welcome`

---

### Layout responsive -- passage en 1 colonne sur mobile

> **Ce qu'on verifie :** le layout grille passe de 2 colonnes (avatar + formulaire) a 1 colonne sur un viewport etroit. La part auto couvre la structure DOM (2 sections dans une grille), la part manuelle couvre le rendu responsive reel.

**Preconditions**
- Navigateur en plein ecran desktop (>= 760px de large)

**Etapes**
1. Observer le layout : l'avatar companion avec le wordmark MIMIR est a gauche, le formulaire (barre de progression + question + boutons) est a droite.
2. Ouvrir les DevTools, activer le mode responsive.
3. Reduire la largeur du viewport a 375px (iPhone SE).
4. Observer le layout : les 2 colonnes passent en 1 seule colonne.

**Resultat attendu**
- En desktop : 2 colonnes cote a cote, l'avatar a gauche et le formulaire a droite.
- En mobile : 1 seule colonne, l'avatar au-dessus du formulaire.
- Les espacements restent corrects (pas de debordement, pas de texte tronque).

- [ ] Passe

---

### Barre de progression -- rendu visuel et transition entre etapes

> **Ce qu'on verifie :** les traits de la barre de progression ont les bonnes couleurs et la transition entre etapes est fluide. La part auto couvre le nombre de traits, le compteur texte et les largeurs inline. La part manuelle couvre le rendu des couleurs et la fluidite de la transition.

**Preconditions**
- Page `/welcome` chargee, etape 1 visible

**Etapes**
1. Observer la barre de progression en haut de la colonne droite : 5 traits horizontaux et le compteur "1 / 5".
2. Verifier que le 1er trait est plus large que les autres et visuellement distinct (couleur claire type cyan/turquoise).
3. Cliquer sur "Continuer".
4. Observer la transition : le 1er trait retrecit, le 2e trait s'elargit. La transition est fluide (pas de saut brusque).
5. Repeter jusqu'a l'etape 5 en verifiant que le trait actif se deplace a chaque fois.

**Resultat attendu**
- Le trait actif est clairement plus large (22px) et d'une couleur distincte (cyan clair) par rapport aux traits inactifs (6px, quasi invisibles).
- La transition entre traits est animee (300ms), pas instantanee.
- Le compteur s'incremente correctement de "1 / 5" a "5 / 5".

- [ ] Passe

---

### Chips actifs -- style visuel de selection

> **Ce qu'on verifie :** le style visuel d'un chip selectionne est visuellement distinct d'un chip non selectionne. La part auto couvre le toggle aria-checked et le role checkbox. La part manuelle couvre le rendu visuel (fond, bordure, couleur du texte).

**Preconditions**
- Naviguer jusqu'a l'etape 3 (cliquer "Continuer" 2 fois depuis l'etape 1)

**Etapes**
1. Observer les 6 chips affiches ("Structurer mes projets", "Trouver un poste", etc.). Tous sont dans leur etat inactif.
2. Cliquer sur "Structurer mes projets".
3. Observer le changement visuel du chip : il doit etre visuellement distinct des autres (fond plus clair, bordure plus visible, texte plus lumineux).
4. Cliquer sur "Apprendre" pour selectionner un 2e chip.
5. Verifier que les 2 chips selectionnes ont le meme style actif, et que les 4 autres restent dans le style inactif.
6. Cliquer a nouveau sur "Structurer mes projets" pour le deselectionner.
7. Verifier qu'il revient au style inactif.

**Resultat attendu**
- Un chip inactif a un fond quasi transparent et un texte attenue.
- Un chip actif a un fond legerement lumineux, une bordure visible et un texte clair.
- La distinction entre actif et inactif est immediate, sans avoir a chercher.

- [ ] Passe
