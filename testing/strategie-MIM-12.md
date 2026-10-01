## Strategie de test -- MIM-12 (Construire l'Assistant)

| Critere | Type | Fait |
|---|---|---|
| La page ne defile jamais | 🟠 | ⬜ Auto · ⬜ Smoke |
| Le Composer est toujours visible | 🟠 | ⬜ Auto · ⬜ Smoke |
| L'avatar est le seul element flexible (min 150px, max 480px, 120px si demande en cours et vh < 640) | 🟠 | ⬜ Auto · ⬜ Smoke |
| La reponse defile dans sa propre zone (34vh max, mask-image en fondu bas) | 🟠 | ⬜ Auto · ⬜ Smoke |
| Composer texte : Entree envoie, placeholder "Parlez a Mimir" | 🟢 | ⬜ |
| Composer voix : bouton micro 64px, glow quand actif | 🟠 | ⬜ Auto · ⬜ Smoke |
| SuggestionChips : masquees pendant une demande | 🟢 | ⬜ |
| ThreadDrawer : s'ouvre par bouton pilule, Echap ferme, ne recouvre jamais le visage | 🟠 | ⬜ Auto · ⬜ Smoke |
| Panneaux ambiants visibles >= 1180px en idle, disparaissent pendant une demande | 🟠 | ⬜ Auto · ⬜ Smoke |
| SpokenResponse : pas de bulles, pas d'avatar de message | 🟠 | ⬜ Auto · ⬜ Smoke |
| Greeting masque si vh < 700, "Votre demande" masque si vh < 640 | 🟠 | ⬜ Auto · ⬜ Smoke |
| Mobile : espace 84px reserve en bas pour BottomBar | 🟠 | ⬜ Auto · ⬜ Smoke |
| L'ecran Assistant est rendu sur la route `/mimir` dans l'app | 🟢 | ⬜ |

### Raisonnement par critere

**La page ne defile jamais** -- 🟠
Auto : la scene porte bien les classes qui interdisent le defilement (`overflow-hidden`, `min-h-0`, `flex-1`), et le conteneur racine de l'ecran n'a aucun `overflow-auto`/`overflow-scroll`. Structure verifiable dans `Assistant.test.tsx`.
Manuel : l'absence reelle de barre de defilement et de rebond a 390x844, 1280x720 et 1440x900. jsdom ne calcule aucune hauteur, il ne peut pas prouver que le contenu tient dans le viewport.

**Le Composer est toujours visible** -- 🟠
Auto : le Composer est rendu dans le DOM dans les 6 etats de la scene (idle, listening, thinking, processing, responding, success), y compris quand une reponse longue est affichee.
Manuel : il reste effectivement a l'ecran, ancre en bas, sans etre pousse hors du viewport quand la reponse atteint sa hauteur maximale sur un ecran court.

**L'avatar est le seul element flexible** -- 🟠
Auto : la fonction pure qui calcule la hauteur maximale du stage (entrees : hauteur du viewport, demande en cours ou non ; sortie : 480 ou 120) vit dans `logic/` et se teste sans navigateur ; le wrapper du stage est le seul enfant de la scene a porter la classe de flex, les autres blocs portent `shrink-0`.
Manuel : l'avatar grandit et retrecit bien quand on redimensionne la fenetre pendant que les autres blocs gardent leur taille, et il ne descend jamais sous 150px.

**La reponse defile dans sa propre zone** -- 🟠
Auto : le conteneur de `SpokenResponse` porte `max-height: 34vh`, un overflow vertical, la classe qui masque la barre de defilement, et le style `mask-image: linear-gradient(180deg,#000 78%,transparent)`.
Manuel : avec un texte long, la zone defile vraiment sans barre visible et le texte s'estompe en bas au lieu d'etre coupe net.

**Composer texte : Entree envoie, placeholder "Parlez a Mimir"** -- 🟢
L'input porte le placeholder exact "Parlez a Mimir". Taper un texte puis presser Entree declenche l'envoi (la demande passe dans `RequestEcho`, le champ se vide). Le bouton "Envoyer" produit le meme resultat. Un champ vide n'envoie rien. Interaction clavier pure, entierement couverte par Testing Library.

**Composer voix : bouton micro 64px, glow quand actif** -- 🟠
Auto : le bouton micro est rendu avec un nom accessible, ses classes de taille (64px), un `aria-pressed` qui bascule au clic, l'indication qui passe de "Appuyez et parlez" a "Mimir vous ecoute", et la classe de glow appliquee uniquement a l'etat actif.
Manuel : le glow a la bonne couleur et la bonne intensite, le bouton est bien rond et l'etat actif se distingue au premier coup d'oeil.

**SuggestionChips : masquees pendant une demande** -- 🟢
En idle, les chips sont presentes dans le DOM. Des qu'une demande est envoyee, elles n'y sont plus (`queryByText(...)` renvoie `null`) pour chacun des etats listening, thinking, processing, responding. Au retour en idle, elles reapparaissent. Affichage conditionnel pur.

**ThreadDrawer : s'ouvre par bouton pilule, Echap ferme, ne recouvre jamais le visage** -- 🟠
Auto : le bouton "Fil de l'echange · N" est present avec son compteur ; le clic rend le tiroir (role `dialog`) ; la touche Echap le retire du DOM ; les entrees affichent les roles "Vous" et "Mimir".
Manuel : le tiroir se pose a droite de la scene sans passer par-dessus le visage de l'avatar, a 1280px comme a 1440px. La geometrie de recouvrement n'existe pas dans jsdom.

**Panneaux ambiants visibles >= 1180px en idle** -- 🟠
Auto : avec `matchMedia` bouchonne a >= 1180px, les panneaux "Aujourd'hui" (3 evenements) et "Contexte actif" sont rendus en idle ; bouchonne sous 1180px, ils sont absents ; a >= 1180px mais avec une demande en cours, ils sont absents aussi.
Manuel : le basculement se produit bien au vrai seuil de 1180px en redimensionnant, les panneaux sont places en haut a gauche et en haut a droite, et leur opacite attenuee ne gene pas la lecture.

**SpokenResponse : pas de bulles, pas d'avatar de message** -- 🟠
Auto : aucun element d'avatar (`img`, `role="img"`) n'est rendu a cote du texte de la reponse, et le texte n'est pas enveloppe dans un conteneur de bulle.
Manuel : a l'ecran, la reponse se lit comme une parole posee sur le fond, sans fond colore, sans bordure et sans carte derriere le texte. Un fond de bulle pose en CSS ne se voit pas depuis jsdom.

**Greeting masque si vh < 700, "Votre demande" masque si vh < 640** -- 🟠
Auto : les 2 decisions de seuil sont des fonctions pures testees sur leurs bornes (699/700 et 639/640) ; avec `matchMedia` bouchonne, le greeting "Bonjour [prenom]." et le libelle "Votre demande" sont presents ou absents du DOM en consequence.
Manuel : en reduisant reellement la hauteur de la fenetre, le greeting puis le libelle disparaissent aux bons moments et la scene reste equilibree apres leur disparition.

**Mobile : espace 84px reserve en bas pour BottomBar** -- 🟠
Auto : sous le breakpoint mobile, le conteneur de la scene porte la reserve de 84px en bas.
Manuel : a 390x844, le Composer et les chips ne passent jamais sous la BottomBar et restent entierement cliquables.

**L'ecran Assistant est rendu sur la route `/mimir`** -- 🟢
Critere d'integration route impose par `tests-strategie.md`. Le test vit dans `App.test.tsx` : navigation vers `/mimir`, puis verification qu'un element propre a l'Assistant est present dans le DOM. Le playground actuel (`MimirAvatar Playground`) est remplace, l'entree correspondante de la table de routes doit etre mise a jour.

## A verifier manuellement

10 scenarios dans [`testing/smokes-MIM-12.md`](smokes-MIM-12.md).
