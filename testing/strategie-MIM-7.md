## Strategie de test -- MIM-7 (Composants UI de base)

| # | Critere | Type | Verification | Fichier |
|---|---------|------|--------------|---------|
| 1 | Chaque composant dans components/ui/, restyle avec les tokens Mimir | Composant | 🟠 Mixte | *.test.tsx |
| 2 | Button : 4 variantes + disabled, cursor-pointer par defaut, glow sur primary | Composant | 🟠 Mixte | Button.test.tsx |
| 3 | TextField : fond/bordure/focus conformes aux tokens | Composant | 🟠 Mixte | TextField.test.tsx |
| 4 | Toggle : transition 300ms, role switch | Composant | 🟠 Mixte | Toggle.test.tsx |
| 5 | Chip : etats actif/inactif, role checkbox | Composant | 🟢 Auto | Chip.test.tsx |
| 6 | Toast : positionnement responsive, auto-dismiss 6s, variante alerte | Composant | 🟠 Mixte | Toast.test.tsx |
| 7 | Modal : focus trap, Echap, aria-modal, titre relie | Composant | 🟢 Auto | Modal.test.tsx |
| 8 | Focus visible sur tous les composants (contour rgba(L,.75), decale 3px) | Composant | 🟠 Mixte | *.test.tsx |
| 9 | Cibles tactiles de 44px minimum | Composant | 🟠 Mixte | *.test.tsx |

---

### Detail

- **#1** Auto : chaque composant (Button, TextField, Toggle, Chip, Segmented, Toast, Modal, ArcSpinner, Skeleton) se rend sans erreur. Manuel : verifier visuellement que les couleurs, arrondis et espacements correspondent aux tokens Mimir definis dans le design system.

- **#2** Auto : rendre Button dans chaque variante (primary, secondary, ghost, destructive), verifier que chacune applique sa classe distincte. Verifier que disabled empeche le clic et applique l'attribut `disabled`. Verifier que la classe `cursor-pointer` est presente par defaut et absente en disabled. Verifier que la variante primary porte la classe de glow (box-shadow). Manuel : verifier visuellement le rendu du glow sur primary (lueur, couleur, intensite).

- **#3** Auto : rendre TextField, verifier qu'il accepte la saisie, que le focus applique les classes/styles attendus (fond, bordure). Manuel : verifier visuellement que fond, bordure et etat focus correspondent aux tokens (`--field`, `--field-focus`, rayon 14px).

- **#4** Auto : verifier que Toggle a `role="switch"` et `aria-checked`. Cliquer et verifier que `aria-checked` bascule. Verifier que la classe de transition (duration-300 ou equivalent) est presente sur l'element anime. Manuel : verifier visuellement que la transition est fluide et dure environ 300ms.

- **#5** Verifier que Chip a `role="checkbox"` et `aria-pressed`. Cliquer et verifier que `aria-pressed` bascule entre true et false. Verifier que l'etat actif et inactif appliquent des classes differentes.

- **#6** Auto : declencher un toast, verifier qu'il apparait dans le DOM. Utiliser les fake timers de Vitest pour avancer de 6s et verifier que le toast disparait. Rendre la variante alerte et verifier qu'elle porte une classe/un role distinctif. Manuel : verifier visuellement le positionnement en desktop (en haut a droite ou selon la maquette) et en mobile (pleine largeur ou selon la maquette).

- **#7** Ouvrir le modal, verifier que `aria-modal="true"` est present. Verifier que le titre du modal est relie au dialog via `aria-labelledby`. Simuler la touche Echap et verifier que le modal se ferme. Tester le focus trap : apres ouverture, Tab doit cycler le focus a l'interieur du modal sans en sortir.

- **#8** Auto : pour chaque composant interactif, simuler le focus (via Tab ou `focus()`) et verifier qu'une classe d'outline/ring est appliquee. Manuel : verifier visuellement que le contour est en `rgba(L,.75)` avec un offset de 3px sur chaque composant.

- **#9** Auto : pour chaque composant interactif (Button, TextField, Toggle, Chip, Segmented), verifier la presence d'une classe de hauteur minimale (min-h-11 ou equivalent 44px). Manuel : verifier visuellement dans le navigateur que les cibles tactiles atteignent bien 44px, en particulier sur les composants compacts (Chip, Toggle).
