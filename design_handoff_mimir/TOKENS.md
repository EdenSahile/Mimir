# Design tokens — Mímir

Tous les tokens sont **[EXACT]**. Les mêmes valeurs existent en variables CSS dans `tokens.css`.

## 1. Couleurs

Le fond est un noir bleuté profond. Il n'y a qu'une seule couleur d'accent : une lumière froide presque blanche (`--light`). Ce n'est jamais un bleu électrique ni un violet. Une lumière chaude (`--light-warm`) est réservée à l'état Responding, quand Mímir parle.

| Token | Valeur | Usage |
|---|---|---|
| `--void` | `#04060A` | Fond de toutes les vues |
| `--void-2` | `#05080C` | Haut du dégradé de fond |
| `--void-3` | `#030508` | Bas du dégradé de fond |
| `--deep` | `rgba(22,40,48,.55)` | Radial d'ambiance (1200×800 à 50 % 28 %) |
| `--deep-2` | `rgba(18,28,40,.45)` | Radial secondaire (900×600 à 82 % 92 %) |
| `--ink-strong` | `#EFF6F7` | Titres, parole de Mímir |
| `--ink` | `#E6EEF0` | Texte courant |
| `--ink-2` | `rgba(230,238,240,.66–.72)` | Texte secondaire, descriptions |
| `--ink-3` | `rgba(230,238,240,.56–.62)` | Métadonnées. **Plancher absolu : 0.55** |
| `--light` | `#CEF4F8` = `rgba(206,244,248,1)` | Accent : lumière de Mímir, actif, focus |
| `--light-hover` | `#EAFBFD` | Texte actif sur fond lumière, liens au survol |
| `--light-warm` | `#EEF2E4` = `rgba(238,242,228,1)` | Lumière de l'avatar en Responding uniquement |
| `--caution` | `#E8C79A` (texte `rgba(236,210,170,.95)`) | Échéances, alertes douces |
| `--danger` | `#ECC4B0` (bordure `rgba(232,176,152,.36)`) | Actions destructives |
| `--on-light` | `#041014` | Texte sur bouton primaire |

### Alphas de la lumière (`--light` + opacité)

| Usage | Alpha |
|---|---|
| Fond d'un élément actif (chip, onglet) | .12–.14 |
| Bordure d'un élément actif | .38–.42 |
| Bordure d'un InsightCard | .16 |
| Fond d'un InsightCard | .055 |
| Libellés mono en accent | .68–.80 |
| Anneau de focus | .75 |

### Contrastes

Ratios **approximatifs** mesurés sur `--void`. À vérifier en CI (axe, pa11y) avec les couleurs composées réelles.

| Encre | Ratio | Autorisé pour |
|---|---|---|
| `--ink-strong` | ≈ 18:1 | Tout |
| `--ink` | ≈ 17:1 | Tout |
| `--light` | ≈ 16:1 | Tout |
| `--ink-2` (.66) | ≈ 7:1 | Texte courant |
| `--ink-3` (.56) | ≈ 5:1 | Métadonnées, libellés |
| Tout alpha < .55 | < 4.5:1 | **Interdit pour du texte** (décor uniquement) |

## 2. Typographie

Trois familles, chacune avec un rôle :
- **Instrument Serif** : la voix de Mímir et les titres.
- **DM Sans** : l'interface.
- **JetBrains Mono** : les états, les métadonnées et les libellés système.

| Token | Famille | Taille / interligne | Espacement | Usage |
|---|---|---|---|---|
| `display` | Instrument Serif 400 | `clamp(42px,5.4vw,74px)` / 1.02 | -.015em | H1 landing |
| `title` | Instrument Serif 400 | `clamp(30px,3.4vw,44px)` / 1.08 | 0 | Titre de module |
| `question` | Instrument Serif 400 | `clamp(28px,3.4vw,42px)` / 1.12 | 0 | Question d'onboarding |
| `greeting` | Instrument Serif 400 | `clamp(26px,3vw,38px)` / 1.15 | 0 | « Bonjour Léa. » |
| `voice` | Instrument Serif 400 | `clamp(20px,2.2vw,28px)` / 1.44 | 0 | Réponse parlée de Mímir |
| `reading` | Instrument Serif 400 | `clamp(19px,2.2vw,27px)` / 1.35–1.38 | 0 | InsightCard « Lecture de Mímir » |
| `heading` | Instrument Serif 400 | 21–23px / 1.22 | 0 | Nom de projet, titre d'article |
| `wordmark` | Instrument Serif 400 | 16–22px | .30–.34em | « MÍMIR » |
| `body-l` | DM Sans 400 | 16–16.5px / 1.65 | 0 | Paragraphes landing |
| `body` | DM Sans 400 | 14–15px / 1.6 | 0 | Texte courant, lignes de liste |
| `ui` | DM Sans 400/500 | 13–14.5px | 0 | Boutons, navigation, chips |
| `meta` | DM Sans 400 | 12–12.5px / 1.5 | 0 | Métadonnées |
| `label` | JetBrains Mono 400 | 9.5–10.5px | .16–.26em, CAPITALES | Libellés de section, état de Mímir |
| `data` | JetBrains Mono 400 | 10–22px | .12–.14em | Heures, pourcentages, compteurs |

Règles :
- `text-wrap: pretty` sur tous les titres et paragraphes.
- Aucune taille sous 9.5px. Seuls les libellés mono en capitales descendent sous 12px.
- Pas de gras en serif. L'interface n'utilise pas de graisse au-delà de 500.

## 3. Surfaces et transparences

| Token | Fond | Bordure | Flou | Usage |
|---|---|---|---|---|
| `--glass-1` | `linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.012))` | `1px rgba(255,255,255,.07)` | `blur(16–18px)` | Panels, cards, lignes de projet |
| `--glass-light` | `linear-gradient(180deg, rgba(206,244,248,.055), rgba(255,255,255,.015))` | `1px rgba(206,244,248,.14–.16)` | `blur(18px)` | InsightCard (voix de Mímir) |
| `--glass-action` | `linear-gradient(180deg, rgba(206,244,248,.07), rgba(255,255,255,.015))` | `1px rgba(206,244,248,.18)` | — | Actions Documents |
| `--field` | `rgba(255,255,255,.04–.045)` | `1px rgba(255,255,255,.09–.10)` | `blur(20px)` sur le composer | Inputs, composer |
| `--field-focus` | `rgba(206,244,248,.05)` | `1px rgba(206,244,248,.45–.50)` | — | Input au focus |
| `--overlay` | `rgba(10,14,18,.92–.96)` | `1px rgba(255,255,255,.07–.10)` | `blur(26px)` | ThreadDrawer, modale, feuille mobile |
| `--scrim` | `rgba(2,4,6,.6)` | — | `blur(8px)` | Fond derrière une modale ou une feuille |
| `--chip` | `rgba(255,255,255,.025–.035)` | `1px rgba(255,255,255,.08–.09)` | — | Chips, tags |
| `--divider` | — | `1px rgba(255,255,255,.05–.06)` | — | Séparateurs de lignes |

Règles :
- Deux couches de verre au maximum l'une sur l'autre.
- Pas de verre sur verre à l'intérieur d'une card : les lignes internes utilisent `--divider`.

## 4. Bordures, rayons, ombres, lumière

### Rayons

| Token | Valeur | Usage |
|---|---|---|
| `--r-xs` | 5px | Badges |
| `--r-sm` | 8px | Tags de document |
| `--r-md` | 14px | Inputs, toasts, actions Documents |
| `--r-lg` | 18px | Panels, cards |
| `--r-xl` | 20–22px | InsightCard, modale, barre mobile, feuille mobile |
| `--r-pill` | 999px | Boutons, chips, composer, ModeSwitch |
| `--r-avatar` | `999px 999px 46% 46% / 40% 40% 14% 14%` | Arche du cadre portrait de MimirAvatar |

### Ombres

| Token | Valeur | Usage |
|---|---|---|
| `--shadow-1` | `0 18px 60px rgba(0,0,0,.35)` | Composer, éléments flottants |
| `--shadow-2` | `0 18px 50px rgba(0,0,0,.45–.5)` | Toasts, barre mobile |
| `--shadow-3` | `0 30px 80px rgba(0,0,0,.6)` | Modale, feuille mobile |
| `--shadow-avatar` | `0 30px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.08)` | Cadre de l'avatar (plus le rim) |

### Lumière

| Token | Valeur | Usage |
|---|---|---|
| `--glow-primary` | `0 0 40px rgba(206,244,248,.18)` → hover `0 0 56px rgba(206,244,248,.30)` | Bouton primaire |
| `--glow-mic` | `0 0 44px rgba(206,244,248,.22)` | Micro actif (Listening) |
| `--dot-glow` | `0 0 10px rgba(206,244,248,.8)` | Point de priorité, statut actif |
| `--nav-glow` | `0 0 8px rgba(206,244,248,.9)` | Trait 1px de la navigation active |
| `--rim` | `0 0 0 1px rgba(206,244,248, α)`, α de .12 à .30 selon l'état | Contour du portrait |
| `--halo` | `radial-gradient(42% 36% at 50% Y%, rgba(L, α), transparent 72%)` | Derrière l'avatar. α et Y dépendent de l'état (`MIMIR_AVATAR.md` §4) |

### Fond ambiant de l'application

Le fond est fixe et reste en place quand on change d'écran.
- Les deux radiaux `--deep` et `--deep-2`.
- Une grille de 96px en `rgba(255,255,255,.028)`, à opacité .35, masquée par un radial 1000×700.
- 46 étoiles de 1px en `#CFE9EC`, qui scintillent entre .12 et .5 d'opacité sur 6 à 12 s.

## 5. Espacements et grille

Échelle sur une base de 4 : `4 · 8 · 12 · 16 · 22 · 28 · 44 · 72 · 96`.

| Contexte | Valeur |
|---|---|
| Rail de navigation desktop | 190px fixe, padding `30px 20px 26px 26px` |
| En-tête de l'application | padding `17px clamp(20px,3vw,44px)` ; mobile `14px 20px` |
| Contenu Workspace | padding `clamp(24px,3vw,44px)`, gap 30px entre blocs ; mobile padding `24px 20px`, gap 22px |
| Grilles Workspace | `repeat(auto-fit, minmax(280–300px, 1fr))`, gap 18px |
| Padding des cards | 22–26px |
| Largeur max de l'Assistant | 700–720px (réponse, composer) |
| Barre basse mobile | à 12px des bords, hauteur ≈ 66px ; espace réservé de 84px en bas du contenu |

## 6. Motion

| Token | Valeur | Usage |
|---|---|---|
| `--dur-instant` | 150ms | Hover, focus |
| `--dur-quick` | 300ms | Chips, toggles, onglets |
| `--dur-base` | 500ms | Apparition d'un élément, changement d'état |
| `--dur-slow` | 900ms | Taille de l'avatar, changement de mode |
| `--dur-ambient` | 3–8s | Boucles de respiration (valeur selon l'état) |
| `--ease-presence` | `cubic-bezier(.22,1,.36,1)` | Entrées, tailles, modes |
| `--ease-breath` | `ease-in-out` | Boucles de respiration, regard, bouche |

Keyframes de référence :
- `rise` : `translateY(14px)` + opacité 0, jusqu'à 0 et 1.
- `fade` : opacité 0 → 1.
- `presence` : scale 1 → 1.06, avec un halo de 18px en `--light` à .32.
- `bar` : `scaleY(.32)` → `scaleY(1)`.

Les transitions entre états sont décrites dans `MIMIR_AVATAR.md` §5.
