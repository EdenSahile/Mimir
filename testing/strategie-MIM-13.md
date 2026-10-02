## Strategie de test -- MIM-13 (Implementer la machine d'etat simulee)

| Critere | Type | Fait |
|---|---|---|
| Hook `useMimirConversation()` dans `logic/` | 🟢 | ⬜ |
| L'envoi d'un message declenche la sequence complete des 6 etats | 🟢 | ⬜ |
| Duree minimale par etat : 400ms | 🟢 | ⬜ |
| Sources s'allument une par une en Processing (+320ms) | 🟢 | ⬜ |
| Reponse revelee mot a mot a 55ms/mot en Responding | 🟢 | ⬜ |
| Curseur clignotant pendant la revelation | 🟠 | ⬜ Auto · ⬜ Smoke |
| SuccessPill apparait apres la fin de Responding | 🟢 | ⬜ |
| Retour a idle apres 2.8s de Success | 🟢 | ⬜ |
| `inputMode` persiste entre les envois (texte ou voix) | 🟢 | ⬜ |
| Interruption possible : tout etat -> listening si nouvel envoi | 🟢 | ⬜ |
| [SIMULE] Textes de reponse codes en dur (2 a 3 reponses variees) | 🟢 | ⬜ |

### Raisonnement par critere

**Hook `useMimirConversation()` dans `logic/`** -- 🟢
Le hook vit dans `logic/` et expose l'objet du contrat `{ state, amplitude, request, response, sources, success, send, inputMode }`. `renderHook` monte le hook et verifie la presence de chaque cle et ses valeurs initiales (state `idle`, response vide, sources vide, success faux). Contrat de hook pur, entierement couvert.

**L'envoi d'un message declenche la sequence complete des 6 etats** -- 🟢
Avec `vi.useFakeTimers()`, on appelle `send(...)` puis on avance les timers et on assert que `state` parcourt dans l'ordre idle -> listening -> thinking -> processing -> responding -> success. Machine d'etat deterministe pilotee par timers, testable sans navigateur.

**Duree minimale par etat : 400ms** -- 🟢
Avec les fake timers, on avance d'abord de 399ms et on assert que l'etat n'a pas encore change, puis on franchit le seuil et on assert la transition. La borne de 400ms se verifie exactement sur la valeur de `state`.

**Sources s'allument une par une en Processing (+320ms)** -- 🟢
En Processing, le tableau `sources` se remplit une entree a la fois. On avance les timers par pas de 320ms et on assert que `sources.length` passe de 0 a 1, 2, 3 puis 4. La cadence et le nombre d'elements sont des donnees exposees par le hook. Le rendu lumineux de chaque source a l'ecran relevait de MIM-12 ; ici on ne verifie que la sequence de donnees.

**Reponse revelee mot a mot a 55ms/mot en Responding** -- 🟢
En Responding, `response` s'allonge d'un mot a chaque pas de 55ms. On avance les timers et on assert que `response` contient 1, 2, puis N mots du texte attendu, jusqu'au texte complet. Croissance de chaine deterministe, couverte par les fake timers.

**Curseur clignotant pendant la revelation** -- 🟠
Auto : pendant la revelation (state `responding`, `response` encore en cours de croissance), un element curseur est present, et il disparait une fois le texte complet revele. La presence/absence conditionnelle se teste au niveau composant avec le hook.
Manuel : le curseur clignote reellement a l'ecran (animation CSS du clignotement, rythme, visibilite). jsdom n'execute pas l'animation, le clignotement ne peut pas etre observe en auto.

**SuccessPill apparait apres la fin de Responding** -- 🟢
Le hook expose `success`. On avance les timers jusqu'a la fin de la revelation, puis de 600ms, et on assert que `success` passe a vrai (et que `state` est `success`). La pastille etant rendue conditionnellement sur `success`, sa presence dans le DOM se verifie aussi. Bascule de drapeau deterministe.

**Retour a idle apres 2.8s de Success** -- 🟢
Depuis l'etat `success`, on avance les fake timers de 2799ms (state toujours `success`) puis on franchit 2.8s et on assert `state === 'idle'` avec `response`, `sources` et `success` reinitialises. Minuterie exacte, testable.

**`inputMode` persiste entre les envois (texte ou voix)** -- 🟢
On fixe `inputMode` a `voix`, on lance un cycle complet jusqu'au retour en idle, puis un second envoi, et on assert que `inputMode` vaut toujours `voix`. Persistance d'etat entre deux cycles, pure logique.

**Interruption possible : tout etat -> listening si nouvel envoi** -- 🟢
Depuis chacun des etats (listening, thinking, processing, responding, success), on appelle `send(...)` et on assert que `state` repasse immediatement a `listening`, que les timers precedents sont annules (pas de transition fantome apres avance des timers) et que `response`/`sources` sont remis a zero. Deterministe avec les fake timers.

**[SIMULE] Textes de reponse codes en dur (2 a 3 reponses variees)** -- 🟢
On verifie que le texte revele appartient a l'ensemble code en dur, et que cet ensemble compte 2 a 3 reponses distinctes (sur plusieurs envois, on observe plus d'une valeur possible). Donnees statiques, testables directement.

## A verifier manuellement

1 scenario dans [`testing/smokes-MIM-13.md`](smokes-MIM-13.md).
