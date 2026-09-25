## Strategie de test -- MIM-9 (Integrer MimirAvatar)

| Critere | Type | Fait |
|---|---|---|
| 4 couches rendues dans un conteneur ratio 4:5 | 🟠 | ⬜ Auto · ⬜ Smoke |
| Placeholder (silhouette CSS) avec tete, cou, epaules, couture verticale | 🟠 | ⬜ Auto · ⬜ Smoke |
| 6 etats visuellement distincts par forme et mouvement, pas seulement par lumiere | 🟠 | ⬜ Auto · ⬜ Smoke |
| Transitions interpolees entre etats (400-700ms selon les paires) | 🟠 | ⬜ Auto · ⬜ Smoke |
| 4 tailles : stage, hero, companion, presence | 🟢 | ⬜ |
| Respiration en boucle (duree variable par etat) | 🟠 | ⬜ Auto · ⬜ Smoke |
| Particules en angle d'or avec derive verticale | 🟠 | ⬜ Auto · ⬜ Smoke |
| aria-hidden="true" sur l'avatar | 🟢 | ⬜ |
| reduced-motion : intensity 0.4, boucles arretees, etat lisible par position/teinte/libelle | 🟠 | ⬜ Auto · ⬜ Smoke |

### Raisonnement par critere

**4 couches rendues dans un conteneur ratio 4:5** -- 🟠
Auto : verifier que le conteneur a le style `aspect-ratio: 4/5` et que 4 elements de couche (Back, Frame, Front, Outer) sont rendus dans le DOM. Manuel : la superposition visuelle des couches est correcte a l'ecran.

**Placeholder (silhouette CSS) avec tete, cou, epaules, couture verticale** -- 🟠
Auto : verifier la presence des elements DOM pour la tete, le cou, les epaules et la couture verticale quand `media` vaut `placeholder`. Manuel : les gradients radiaux et le rendu CSS forment une silhouette reconnaissable.

**6 etats visuellement distincts par forme et mouvement** -- 🟠
Auto : pour chaque valeur de `state`, verifier que les bons elements sont presents dans le DOM (ondes en Listening, arcs en Thinking, reperes et balayage en Processing, bouche en Responding, ondes sortantes en Success). Manuel : les 6 etats se distinguent visuellement par la forme et le mouvement, pas seulement par la lumiere.

**Transitions interpolees entre etats (400-700ms)** -- 🟠
Auto : verifier que les proprietes CSS `transition` sont appliquees avec les durees attendues (400ms Idle->Listening, 600ms Listening->Thinking, etc.), et que les elements entrants/sortants ont un fondu de 400ms. Manuel : les transitions sont fluides et perceptuellement correctes a l'ecran.

**4 tailles : stage, hero, companion, presence** -- 🟢
Chaque valeur du prop `size` applique les bonnes classes ou styles CSS. Entierement verifiable en auto : rendre le composant avec chaque taille et verifier les classes/dimensions resultantes.

**Respiration en boucle (duree variable par etat)** -- 🟠
Auto : verifier que l'animation de respiration a la bonne duree CSS par etat (8s idle, 3.4s listening, 2.6s thinking, aucune processing, 4.4s responding, 6s success). Manuel : le rendu a l'ecran evoque une respiration (scale lent et regulier).

**Particules en angle d'or avec derive verticale** -- 🟠
Auto : tester la logique de calcul de l'angle d'or en tant que fonction pure. Verifier le nombre de particules rendues par etat (8 idle, 13 listening, 15 thinking, etc.) et la presence des elements DOM. Manuel : les particules sont distribuees visuellement en angle d'or et derivent verticalement.

**aria-hidden="true" sur l'avatar** -- 🟢
Attribut DOM testable directement avec Testing Library. Aucune tranche manuelle.

**reduced-motion : intensity 0.4, boucles arretees, etat lisible** -- 🟠
Auto : simuler `prefers-reduced-motion: reduce` et verifier que l'intensity passe a 0.4, que les animations en boucle sont arretees (pas de classe d'animation ou `animation: none`). Manuel : les etats restent distinguables sans mouvement, par la position du halo, la teinte, et les elements statiques.

## A verifier manuellement

7 scenarios dans [`testing/smokes-MIM-9.md`](smokes-MIM-9.md).
