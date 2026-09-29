## Strategie de test -- MIM-11 (Construire Onboarding)

| Critere | Type | Fait |
|---|---|---|
| Layout grille auto-fit minmax(320px,1fr), avatar companion a gauche, formulaire a droite (max 560px) | 🟠 | ✅ Auto · ⬜ Smoke |
| Barre de progression : 5 traits, actif 22px / inactifs 6px, compteur mono "N / 5" | 🟠 | ✅ Auto · ⬜ Smoke |
| Chaque etape affiche kicker mono, question en serif, texte d'aide | 🟢 | ✅ |
| Etapes 1-2 : champ texte (TextField) avec placeholder | 🟢 | ✅ |
| Etapes 3-5 : chips a choix multiple (role checkbox, aria-checked toggle) | 🟠 | ✅ Auto · ⬜ Smoke |
| 5 questions avec les textes exacts du prototype (identite, activite, objectifs, interets, usage) | 🟢 | ✅ |
| Etat de l'avatar suit l'etape (idle, listening, thinking, processing, responding) | 🟢 | ✅ |
| "Continuer" (primary) avance a l'etape suivante, "Passer" (lien) aussi | 🟢 | ✅ |
| Derniere etape : CTA "Entrer dans Mimir" navigue vers /mimir, "Passer" absent | 🟢 | ✅ |
| Colonne avatar : wordmark MIMIR, phrase rassurante, avatar companion | 🟢 | ✅ |

### Raisonnement par critere

**Layout grille auto-fit minmax(320px,1fr)** -- 🟠
Auto : verifier la structure DOM (grille root avec 2 sections enfants, la section formulaire porte `max-w-[560px]`, la section avatar contient MimirAvatar + wordmark). Manuel : le layout passe effectivement en 1 colonne sur un viewport mobile, l'avatar apparait au-dessus du formulaire, les espacements sont corrects.

**Barre de progression : 5 traits, actif 22px / inactifs 6px, compteur mono** -- 🟠
Auto : 5 elements `progress-dot` rendus, le compteur affiche "1 / 5" au demarrage et s'incremente a chaque etape, le trait actif a un width inline de 22 et les inactifs de 6. Manuel : les couleurs des traits (actif en `rgba(206,244,248,.85)`, inactifs en `rgba(255,255,255,.15)`) sont visuellement distinctes, la transition `duration-300` entre etapes est fluide.

**Chaque etape affiche kicker mono, question en serif, texte d'aide** -- 🟢
Pour chaque etape, verifier la presence du kicker (span mono), du heading h2 (question), et du paragraphe d'aide dans le DOM. Les textes changent a chaque avancement.

**Etapes 1-2 : champ texte avec placeholder** -- 🟢
A l'etape 1, un input avec placeholder "Votre prenom" est present. A l'etape 2, un input avec placeholder "ex. product designer, freelance". La saisie met a jour la valeur.

**Etapes 3-5 : chips a choix multiple** -- 🟠
Auto : les chips sont rendus avec `role="checkbox"` et `aria-checked`, le toggle fonctionne (clic passe de false a true et inversement), les labels correspondent aux options du prototype (6 chips pour objectifs, 6 pour interets, 4 pour usage). Manuel : le style visuel du chip actif (fond, bordure, couleur) est visuellement distinct du chip inactif.

**5 questions avec les textes exacts du prototype** -- 🟢
Verifier chaque texte exact : kickers ("Etape 1 . Identite" a "Etape 5 . Usage"), questions, textes d'aide, placeholders et labels d'options. Les donnees source sont dans `data/onboarding.ts`.

**Etat de l'avatar suit l'etape** -- 🟢
MimirAvatar recoit le state correspondant a chaque etape : idle (etape 1), listening (2), thinking (3), processing (4), responding (5). Verifiable en testant le prop `state` passe au composant.

**"Continuer" avance, "Passer" aussi** -- 🟢
Cliquer "Continuer" fait passer a l'etape suivante (kicker et question changent). Cliquer "Passer" produit le meme resultat. Les 2 boutons sont presents aux etapes 1 a 4.

**Derniere etape : CTA "Entrer dans Mimir"** -- 🟢
A l'etape 5, le bouton affiche "Entrer dans Mimir" au lieu de "Continuer". Le bouton "Passer" n'est pas rendu. Cliquer le CTA appelle `navigate('/mimir')`.

**Colonne avatar : wordmark MIMIR, phrase rassurante, avatar companion** -- 🟢
Le texte "MIMIR" est present dans le DOM. La phrase "Quelques reperes suffisent pour commencer. Vous pourrez tout ajuster plus tard." est presente. Le composant MimirAvatar est rendu avec `size="companion"`.

## A verifier manuellement

3 scenarios dans [`testing/smokes-MIM-11.md`](smokes-MIM-11.md).
