# Smoke tests -- MIM-10 (Construire Landing)

> Ces scenarios sont ecrits **avant** l'implementation (test-first).
> Ils s'executent **apres**, app lancee dans le navigateur.

## Preconditions generales

- App lancee (`pnpm dev`)
- Navigateur ouvert sur `http://localhost:5173`
- La page Landing s'affiche (route `/`)

---

### Layout responsive -- passage en 1 colonne sur mobile

> **Ce qu'on verifie :** le layout passe de 2 colonnes a 1 colonne a une largeur mobile, et l'avatar se retrouve sous le texte. La part auto verifie la structure de grille et la presence des 2 colonnes dans le DOM.

**Preconditions**
- Navigateur en plein ecran desktop (largeur > 768px)

**Etapes**
1. Observer la page : le texte (kicker, H1, paragraphe, boutons, tags) est a gauche, l'avatar MimirAvatar est a droite
2. Ouvrir les devtools et passer en mode responsive (ou reduire la fenetre en dessous de 640px de large)
3. Observer la disposition : le contenu passe en 1 seule colonne
4. Verifier que l'avatar apparait **sous** le bloc de texte, pas au-dessus

**Resultat attendu**
- En desktop : 2 colonnes cote a cote
- En mobile : 1 colonne, texte d'abord puis avatar en dessous

- [ ] Passe

---

### H1 -- rendu typographique Instrument Serif

> **Ce qu'on verifie :** le H1 s'affiche dans le font Instrument Serif avec un dimensionnement fluide. La part auto verifie la presence du `<h1>` avec le bon texte et la classe de font.

**Preconditions**
- Page Landing affichee en desktop

**Etapes**
1. Observer le titre principal "Une intelligence qui connait votre contexte."
2. Verifier que le font est bien un serif italique/display (Instrument Serif), pas le font sans-serif du reste de la page
3. Reduire la fenetre progressivement : le titre doit diminuer de taille de facon fluide (pas de saut brusque a un breakpoint)
4. A la largeur minimale (~320px), le titre doit rester lisible (environ 42px)
5. A la largeur maximale (ecran large), le titre ne doit pas depasser environ 74px

**Resultat attendu**
- Le font est un serif display, visuellement distinct du font body
- La taille varie de facon fluide entre les extremes

- [ ] Passe

---

### Animations d'entree -- rise et fade

> **Ce qu'on verifie :** les animations d'entree rendent visuellement l'effet attendu. La part auto verifie que les classes d'animation sont appliquees aux bons elements.

**Preconditions**
- Vider le cache du navigateur ou ouvrir un onglet en navigation privee

**Etapes**
1. Charger la page Landing
2. Observer la colonne gauche : le texte doit monter depuis le bas (effet "rise") sur environ 900ms
3. Observer l'avatar a droite : il doit apparaitre en fondu (effet "fade") sur environ 1.6s
4. L'animation de l'avatar doit durer plus longtemps que celle du texte
5. Recharger la page pour revoir les animations

**Resultat attendu**
- Le texte monte de facon fluide, sans saccade
- L'avatar apparait progressivement en fondu
- Les 2 animations demarrent au chargement et ne se rejouent pas ensuite

- [ ] Passe

---

### Pied de page -- rendu visuel des colonnes et separateurs

> **Ce qu'on verifie :** le pied de page s'affiche correctement avec ses 3 colonnes et ses separateurs visuels. La part auto verifie la presence des 3 colonnes et des elements separateurs dans le DOM.

**Preconditions**
- Page Landing affichee, scroll jusqu'en bas si necessaire

**Etapes**
1. Observer le pied de page en bas de la page
2. Verifier qu'il contient 3 colonnes cote a cote : Presence, Contexte, Controle
3. Verifier que les separateurs entre les colonnes sont visibles comme des traits verticaux fins (1px)
4. Verifier que le fond du pied est legerement plus clair que le fond de la page (opacite .028)
5. Verifier que les coins du conteneur du pied sont arrondis (rayon de 16px)

**Resultat attendu**
- 3 colonnes lisibles avec des separateurs fins et visibles entre elles
- Le conteneur a un fond subtil et des coins arrondis

- [ ] Passe
