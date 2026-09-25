# Smoke tests -- MIM-9 (Integrer MimirAvatar)

> Ces scenarios sont ecrits **avant** l'implementation (test-first).
> Ils s'executent **apres**, app lancee dans le navigateur.

## Preconditions generales

- App lancee (`pnpm dev`)
- Navigateur ouvert sur `http://localhost:5173`
- L'ecran affiche le composant `MimirAvatar` (ou une page de dev / storybook qui le rend)

---

### 4 couches -- superposition visuelle

> **Ce qu'on verifie :** les 4 couches (Back, Frame, Front, Outer) se superposent correctement a l'ecran. La part auto verifie la presence des 4 couches et le ratio 4:5 du conteneur. Ici on verifie que le rendu visuel est correct.

**Preconditions**
- Le composant est rendu en taille `stage` a l'etat `idle`

**Etapes**
1. Observer le composant a l'ecran
2. Verifier que le halo (couche Back) est visible derriere le cadre
3. Verifier que le cadre portrait (couche Frame) est visible avec ses bords arrondis
4. Verifier que les elements de la couche Front (regard) apparaissent a l'interieur du cadre, pas en dehors
5. Verifier que les elements de la couche Outer (particules) apparaissent en dehors du cadre

**Resultat attendu**
- Les 4 couches sont visibles et correctement empilees : le halo derriere, le cadre au centre, le regard dans le cadre, les particules autour

- [ ] Passe

---

### Placeholder -- silhouette reconnaissable

> **Ce qu'on verifie :** la silhouette CSS ressemble visuellement a un buste humain. La part auto verifie la presence des elements DOM (tete, cou, epaules, couture). Ici on verifie le rendu visuel.

**Preconditions**
- Le composant est rendu avec `media = { kind: 'placeholder' }` (defaut)

**Etapes**
1. Observer le cadre portrait
2. Identifier la forme de tete (gradient radial dans le tiers superieur)
3. Identifier le cou entre la tete et les epaules
4. Identifier les epaules (gradient radial dans la partie basse)
5. Identifier la couture verticale (trait fin de 1px qui descend du haut du cadre)

**Resultat attendu**
- La silhouette evoque un buste humain, avec tete, cou, epaules et une ligne verticale centrale visible

- [ ] Passe

---

### 6 etats -- distinction visuelle par forme et mouvement

> **Ce qu'on verifie :** chaque etat se distingue des autres par la forme ou le mouvement, pas seulement par un changement de luminosite. La part auto verifie la presence des bons elements DOM par etat. Ici on verifie la distinction perceptuelle.

**Preconditions**
- Le composant est rendu en taille `stage`
- Possibilite de changer l'etat via un controle (playground, props, devtools)

**Etapes**
1. Passer en `idle` : observer la respiration lente, pas d'elements speciaux autour
2. Passer en `listening` : verifier que des ondes entrantes apparaissent (anneaux qui se rapprochent)
3. Passer en `thinking` : verifier que le halo monte au-dessus de la tete et que des arcs tournent rapidement
4. Passer en `processing` : verifier que des reperes (traits) apparaissent et qu'un balayage vertical traverse le cadre
5. Passer en `responding` : verifier que la teinte se rechauffe et que la bouche s'active
6. Passer en `success` : verifier que des ondes sortent vers l'exterieur et qu'un flash se produit sur le rim

**Resultat attendu**
- Les 6 etats sont distinguables au premier coup d'oeil par leur forme ou leur mouvement, pas seulement par la couleur ou l'opacite

- [ ] Passe

---

### Transitions -- fluidite entre etats

> **Ce qu'on verifie :** les transitions entre etats sont fluides et interpolees. La part auto verifie les proprietes CSS `transition` et les durees. Ici on verifie la fluidite percue.

**Preconditions**
- Le composant est rendu en taille `stage` a l'etat `idle`

**Etapes**
1. Passer de `idle` a `listening` : observer que le rim s'eclaire progressivement (~400ms)
2. Passer de `listening` a `thinking` : observer que le halo monte en douceur (~600ms)
3. Passer de `thinking` a `processing` : observer que les arcs disparaissent en fondu et les reperes apparaissent (~500ms)
4. Passer de `processing` a `responding` : observer que la teinte se rechauffe progressivement (~700ms)
5. Passer de `responding` a `success` : observer le flash du rim et les ondes sortantes (~600ms)

**Resultat attendu**
- Aucune transition n'est instantanee (pas de saut brutal)
- Les elements qui apparaissent ou disparaissent passent par un fondu, pas un montage/demontage brutal

- [ ] Passe

---

### Respiration -- rendu d'animation

> **Ce qu'on verifie :** l'animation de respiration evoque visuellement un mouvement lent et regulier (scale). La part auto verifie les durees CSS par etat. Ici on verifie le rendu perceptuel.

**Preconditions**
- Le composant est rendu en taille `stage`

**Etapes**
1. A l'etat `idle` : observer que le halo pulse lentement (~8s par cycle)
2. Passer en `listening` : observer que la respiration accelere visiblement (~3.4s)
3. Passer en `thinking` : observer une respiration encore plus rapide (~2.6s)
4. Passer en `processing` : observer que la respiration s'arrete
5. Passer en `responding` : observer une respiration moyenne (~4.4s)

**Resultat attendu**
- La pulsation est perceptible et reguliere dans chaque etat
- Le rythme change visiblement entre les etats

- [ ] Passe

---

### Particules -- distribution et derive

> **Ce qu'on verifie :** les particules sont visuellement distribuees en angle d'or (pas en grille ni en cercle regulier) et derivent verticalement. La part auto verifie le nombre de particules et la logique de calcul. Ici on verifie le rendu visuel.

**Preconditions**
- Le composant est rendu en taille `stage` a l'etat `thinking` (15 particules, le maximum)

**Etapes**
1. Observer les particules autour du cadre
2. Verifier qu'elles ne sont pas alignees en grille ni espacees regulierement sur un cercle
3. Observer pendant 3-4 secondes : les particules derivent legerement vers le haut ou le bas (~8px)

**Resultat attendu**
- Les particules sont reparties de facon organique (pas en motif regulier)
- Une derive verticale lente est visible

- [ ] Passe

---

### reduced-motion -- etats lisibles sans animation

> **Ce qu'on verifie :** avec `prefers-reduced-motion: reduce`, les etats restent distinguables sans mouvement. La part auto verifie que l'intensity passe a 0.4 et que les boucles sont arretees. Ici on verifie que les etats sont encore distinguables visuellement.

**Preconditions**
- Activer `prefers-reduced-motion: reduce` dans les devtools du navigateur (Rendering > Emulate CSS media feature)
- Le composant est rendu en taille `stage`

**Etapes**
1. A l'etat `idle` : verifier qu'aucune animation ne tourne (pas de pulsation, pas de rotation)
2. Passer en `thinking` : verifier que le halo est en position haute (pas anime, mais positionne) et que les arcs sont visibles (figes)
3. Passer en `processing` : verifier que les reperes sont visibles (figes)
4. Passer en `responding` : verifier que la teinte chaude est appliquee (sans animation)
5. Pour chaque etat : verifier qu'on distingue l'etat courant par la position du halo, la teinte, ou les elements statiques, sans avoir besoin de voir du mouvement

**Resultat attendu**
- Aucune boucle d'animation ne tourne
- Les effets sont attenues (opacite reduite)
- Les 6 etats restent identifiables par leur configuration statique (position, teinte, elements presents)

- [ ] Passe
