## Strategie de test -- MIM-10 (Construire Landing)

| Critere | Type | Fait |
|---|---|---|
| Layout 2 colonnes desktop, 1 colonne mobile (avatar sous le texte) | 🟠 | ✅ Auto · ⬜ Smoke |
| H1 en Instrument Serif display (`clamp(42px,5.4vw,74px)`) | 🟠 | ✅ Auto · ⬜ Smoke |
| Avatar hero avec cycle Idle -> Listening -> Thinking -> Responding -> Idle | 🟢 | ✅ |
| Cycle arrete si `prefers-reduced-motion` | 🟢 | ✅ |
| "Faire connaissance" mene a `/welcome` | 🟢 | ✅ |
| "Voir l'assistant" mene a `/mimir` | 🟢 | ✅ |
| Colonne gauche en animation `rise` 900ms, avatar en `fade` 1.6s | 🟠 | ✅ Auto · ⬜ Smoke |
| Pied en 3 colonnes avec separateurs de 1px | 🟠 | ✅ Auto · ⬜ Smoke |
| Copy d'interface conforme au prototype (textes exacts) | 🟢 | ✅ |

### Raisonnement par critere

**Layout 2 colonnes desktop, 1 colonne mobile** -- 🟠
Auto : verifier la structure DOM (grille avec `auto-fit minmax(300px,1fr)`), presence des 2 colonnes (gauche et avatar), et que l'avatar est positionne apres le texte dans le flux. Manuel : le layout passe effectivement en 1 colonne a une largeur mobile dans un vrai navigateur, et l'avatar apparait sous le texte.

**H1 en Instrument Serif display** -- 🟠
Auto : verifier la presence d'un `<h1>` avec le bon texte ("Une intelligence qui connait votre contexte.") et la classe/style de font display. Manuel : le font Instrument Serif se charge correctement et le clamp produit la bonne taille de 42px a 74px selon le viewport.

**Avatar hero avec cycle Idle -> Listening -> Thinking -> Responding -> Idle** -- 🟢
Le cycle est une machine d'etats avec des timers. En mockant `vi.useFakeTimers()` et en avancant le temps, on verifie que l'avatar passe par chaque etat dans l'ordre attendu, puis revient a Idle.

**Cycle arrete si `prefers-reduced-motion`** -- 🟢
En mockant `matchMedia` pour simuler `prefers-reduced-motion: reduce`, on verifie que l'avatar reste a l'etat initial et ne progresse pas meme apres ecoulement du temps.

**"Faire connaissance" mene a `/welcome`** -- 🟢
Rendre la page, cliquer sur le bouton "Faire connaissance", verifier que le router a navigue vers `/welcome`.

**"Voir l'assistant" mene a `/mimir`** -- 🟢
Rendre la page, cliquer sur le bouton "Voir l'assistant", verifier que le router a navigue vers `/mimir`.

**Colonne gauche en animation `rise` 900ms, avatar en `fade` 1.6s** -- 🟠
Auto : verifier que la colonne gauche porte la classe ou le style d'animation `rise` avec une duree de 900ms, et que le conteneur avatar porte l'animation `fade` avec une duree de 1.6s. Manuel : les animations rendent visuellement l'effet attendu (montee pour le texte, fondu pour l'avatar).

**Pied en 3 colonnes avec separateurs de 1px** -- 🟠
Auto : verifier que le pied contient 3 elements de colonne (Presence, Contexte, Controle) et que des elements separateurs sont presents dans le DOM. Manuel : les separateurs sont visuellement corrects (1px, visibles sur le fond .028, le rayon de 16px est applique au conteneur).

**Copy d'interface conforme au prototype** -- 🟢
Verifier chaque texte avec Testing Library : kicker ("Assistant personnel · presence contextuelle"), H1, paragraphe descriptif, labels des boutons, labels des 3 tags ("Memoire controlable", "Projets vivants", "Integrations"), titres des colonnes du pied.

## A verifier manuellement

4 scenarios dans [`testing/smokes-MIM-10.md`](smokes-MIM-10.md).
