# Composants réutilisables

Les valeurs visuelles sont **[EXACT]**. Les noms sont proposés pour React/TS. Voir `tokens.css`.

## Fondations

### `AppBackground`
Fond fixe sous toutes les vues : dégradé `--void-2 → --void → --void-3`, les deux radiaux `--deep`, une grille de 96px masquée et 46 étoiles scintillantes. Il ne se remonte pas au changement d'écran.

### `Wordmark`
« MÍMIR » en Instrument Serif, avec un espacement de .30–.34em. Tailles : 16px dans l'en-tête mobile, 18px dans le rail, 21px sur la landing. Au clic, retour à la landing (prototype) ou à l'accueil.

## Mímir

### `MimirAvatar`
Voir `MIMIR_AVATAR.md`.

### `MimirPresence` (`size`: 22 | 26 | 44–50)
Disque de lumière qui représente Mímir hors de l'écran Assistant. Il suit l'état global de Mímir. Il apparaît dans le bouton « Demander à Mímir », la barre mobile, l'InsightCard et les toasts.

### `StateLabel`
Texte JetBrains Mono de 10px, espacé de .26em, en capitales, couleur `rgba(L,.72)`, précédé d'un point de 5px (`--light` + `--dot-glow`, opacité .5 en idle et 1 sinon). Région `aria-live="polite"`.
Libellés : Présent · À l'écoute · Réflexion · Traitement des données · Réponse · Terminé.

### `VoiceBars` (`active`, `level?`)
27 barres de 2px de large, espacées de 3px, dans une zone de 22px de haut. Hauteur de base `4 + |sin(i·1.7)|·16` px. Animation `mim-bar` de 0,6 à 1,15 s, décalée de 45ms par barre. Actives en Listening (opacité .8) et Responding (.6), sinon hauteur 2px et opacité 0 (transition 500ms).
**[À IMPLÉMENTER]** : `level` issu de `amplitude` remplacera l'animation automatique.

### `SourceChips` (`sources: {label, active}[]`)
Chips en mono 9,5px, capitales, padding `7px 12px`, forme pilule.
- Inactive : fond `rgba(255,255,255,.02)`, bordure `.07`, texte `.4`. Décoratif : l'information est portée par l'état actif.
- Active : fond `rgba(L,.1)`, bordure `rgba(L,.34)`, texte `--light-hover`.
- Passage de l'un à l'autre en 450ms.

## Conversation

### `RequestEcho`
Au-dessus de l'avatar. Libellé mono « Votre demande » (masqué si vh < 640), puis la demande en DM Sans 15px `--ink-2`, sur 620px de large au maximum, centrée. Apparaît en `fade` de 700ms.

### `SpokenResponse` (`text`, `revealedWords`, `speaking`)
Sous l'avatar. Instrument Serif `--fs-voice`, interligne 1.44, couleur `#F1F8F9`, centré, 700px de large au maximum. Curseur de 2px×1em en `--light` avec `--dot-glow`, qui clignote en steps pendant la révélation.
Hauteur maximale de 34vh. Au-delà, défilement sans barre visible et fondu bas (`mask-image: linear-gradient(180deg,#000 78%,transparent)`). **Pas de bulle, pas d'avatar de message.**

### `SuccessPill` (`text`, `action?`)
Pilule : fond `rgba(L,.06)`, bordure `rgba(L,.2)`, padding `11px 18px 11px 16px`. Contient un point de 6px lumineux, le texte en 13,5px et un lien optionnel « Ouvrir » (souligné, `--light`). Apparaît en `rise` de 500ms.

### `ThreadDrawer`
Tiroir à droite de la scène, `min(88%, 330px)`, fond `--overlay`, flou 26px. Il s'ouvre depuis le bouton « Fil de l'échange · N » (pilule mono, bordure `rgba(L,.22)`). Chaque entrée affiche un rôle en mono 9px (« Vous » en `--ink-3`, « Mímir » en `rgba(L,.72)`) et le texte en 13,5px. Il ne recouvre jamais le visage de l'avatar. Échap le ferme.

### `Composer` (`mode: 'text' | 'voice'`)
Ancré en bas de la scène (`margin-top: auto`), 720px de large au maximum.
- **Texte** : pilule `--field` avec bordure `.09`, flou 20px et `--shadow-1`, padding `8px 8px 8px 22px`. Input en 15,5px avec le placeholder « Parlez à Mímir ». Bouton primaire « Envoyer » de 40px. Entrée envoie.
- **Voix** : bouton micro rond de 64px, plus l'indication « Appuyez et parlez » ou « Mímir vous écoute ». Actif : fond `rgba(L,.16)`, bordure `rgba(L,.5)`, `--glow-mic`.
- `ModeToggle` Voix / Texte dans l'en-tête (desktop). C'est un réglage de session : la même réponse est dite et écrite.

### `SuggestionChips`
Chips : fond `rgba(255,255,255,.03)`, bordure `.08`, padding `9px 15px`, texte 12,5px `.6` (hover : `--ink`, bordure `rgba(L,.55)`). 4 chips au maximum (3 sous 1000px), sur plusieurs lignes, centrées. **Masquées pendant une demande.**

## Contrôles

### `Button`
Hauteur de 44px minimum. Un seul `primary` par vue.
- `primary` : `linear-gradient(180deg, rgba(206,244,248,.95), rgba(176,226,232,.82))`, texte `--on-light` 14–14,5px en 500, padding `14px 28px`, `--glow-primary` qui devient `--glow-primary-hover` au survol.
- `secondary` : fond `rgba(255,255,255,.04)`, bordure `.1`, texte `rgba(230,238,240,.82)`. Au survol, bordure `rgba(L,.3–.4)`.
- `ghost` : texte `--light` souligné, avec un décalage de soulignement de 4px.
- `destructive` : fond transparent, bordure `--danger-border`, texte `--danger`.
- `disabled` : fond `.03`, bordure `.06`, texte `.4` (exception de contraste : les éléments désactivés en sont dispensés).

### `TextField`
Fond `--field`, bordure `.1`, rayon 14px, padding `15–17px 18–20px`, texte 15–16px. Au focus : bordure `rgba(L,.45)` et fond `rgba(L,.05)`.

### `Toggle`
Piste de 42×24, bouton de 18px.
- On : piste `rgba(L,.2)`, bordure `rgba(L,.4)`, bouton `--light`, décalé de 18px.
- Off : piste `.04`, bordure `.12`, bouton `.4`.
- Transition de 300ms avec `--ease-presence`. Rôle `switch` et `aria-checked`.

### `Chip` (sélectionnable)
Padding `12px 18px` dans l'onboarding, `9px 14px` en compact. Actif : fond `rgba(L,.13)`, bordure `rgba(L,.4)`, texte `--light-hover`. Rôle `checkbox` et `aria-pressed`.

### `Segmented` (onglets de réglages, ModeSwitch)
Conteneur pilule : fond `.03–.035`, bordure `.07`, padding 4px. Élément de 8–9px × 18px, en 13px. Élément actif : fond `rgba(L,.14)`, texte `--light-hover`.

## Navigation

### `NavRail` (desktop ≥ 760px)
190px de large, bordure droite `.05`. Wordmark, puis 8 éléments en texte seul (13,5px, padding 9px 0). Élément actif : couleur `--ink-strong` et trait vertical de 1×13px en `--light` avec `--nav-glow`. Inactif : `.66`, qui passe à `--ink` au survol. **Pas d'icônes.**
Ordre : Mímir · My Day · Projets · AI News · Job Watch · Mémoire · Documents · Réglages.

### `ModeSwitch`
Segmented « Assistant | Workspace » dans l'en-tête desktop.

### `BottomBar` (mobile < 760px)
Fixe, à 12px des bords, fond `rgba(8,12,16,.92)`, bordure `.08`, rayon 22px, flou 22px, `--shadow-2`. Contenu : My Day · Projets · **[MimirPresence 50px]** · Docs · Plus. Chaque cible fait au moins 52×44. La présence centrale mène à l'Assistant et respire selon l'état de Mímir.

### `MoreSheet`
Feuille au-dessus de la BottomBar (`bottom: 92px`), `--overlay`, rayon 22px, `--shadow-3`. Elle contient AI News, Job Watch, Mémoire et Réglages : une ligne par module, en 15px, avec une flèche en mono. Fond `--scrim` derrière. Un tap sur le fond la ferme. Entrée : translateY de 24px à 0 en 400ms.

### `AppHeader`
- Desktop : ModeSwitch, [sélecteur d'état démo, **à retirer**], ModeToggle voix/texte (Assistant uniquement) … horloge mono (≥ 1100px), initiales dans un cercle de 30px, nom (≥ 1100px).
- Mobile : Wordmark … initiales.

## Workspace

### `ModuleHeader` (`kicker`, `title`, `subtitle`)
Kicker en mono 10px `rgba(L,.55–.68)`, titre `--fs-title`, sous-titre en 14,5px `--ink-2` sur 600px au maximum. À droite, le bouton « Demander à Mímir » (secondary, avec une `MimirPresence` de 26px). Il ramène à l'Assistant avec le contexte du module. **[À IMPLÉMENTER]** : le passage de contexte.

### `InsightCard` — la voix de Mímir dans le Workspace
Surface `--glass-light`, rayon 20px, padding `22–26px 26–28px`. Contient une `MimirPresence` de 26px, le libellé mono « Lecture de Mímir » et un texte `--fs-reading` en serif. **Une par module, en tête** (My Day, AI News, Job Watch, Mémoire, détail projet « Ce que Mímir en retient »). C'est ce qui empêche le Workspace de devenir un dashboard.
Le texte est généré par Claude. **[SIMULÉ]** dans le prototype.

### `Panel`
Surface `--glass-1`, rayon 18px, padding 24px. Libellé de section en mono 9,5px `.6`, puis des lignes séparées par `--divider` (padding 10–14px 0).

### `PriorityItem`
Point de 7px, plus un titre en 14–14,5px et une méta en 12px.
- Priorité haute : point `--light` avec `--dot-glow`.
- Moyenne : point `--caution`.
- Basse : point `rgba(255,255,255,.25)`.

La position dans la liste porte aussi l'ordre de priorité : l'information ne dépend pas que de la couleur.

### `ProjectRow`
Bouton pleine largeur en `--glass-1`, padding `22px 26px`, en flex-wrap. À gauche : point, nom en serif 22px, badge de statut, description. À droite, sur 214px : compteur de tâches et % en mono, barre de progression, date de mise à jour. Au survol : bordure `rgba(L,.26)` et fond `rgba(L,.045)`.

### `ProgressBar`
2px de haut, fond `.08`, remplissage `linear-gradient(90deg, rgba(L,.35), rgba(L,.85))`. Toujours accompagnée du % écrit.

### `StatusBadge`
Mono 9–9,5px, capitales, espacement .16em, padding `4–5px 8–9px`, rayon 5px. **Toujours un signe et un mot** :
- `● Actif` et `✓ Connecté` : `rgba(L,.8)`, bordure `rgba(L,.24)`.
- `‖ En pause` et `+ Disponible` : `.6`, bordure `.1`.
- `! Échéance` : `--caution-ink`.

### `NewsItem`
Grille à 2 colonnes (auto-fit, 260px minimum). À gauche : tag et date en mono, titre en serif 23px, résumé en 13,5px. À droite, séparée par une bordure gauche de 1px : « Pourquoi pour vous » (généré par Mímir).

### `JobItem`
Poste en 16,5px, entreprise, note de Mímir. À droite : **affinité** en mono 20px `--light`, « Sauvegarder » (secondary) et « Adapter mon CV » (primary compact). L'action « Adapter mon CV » ouvre l'Assistant avec la demande. **[À IMPLÉMENTER]**

### `PipelineStat`
Bordure haute de 1px, compteur en mono 22px, libellé en 12,5px.

### `MemoryGroup`
Panel titré (Identité, Objectifs, Habitudes, Contexte professionnel) avec son compteur. Chaque ligne affiche le fait et sa **source** (en mono 9px : Onboarding, Conversation, Agenda…). Actions « Modifier » (lumière) et « Oublier » (`--ink-3`), qui ouvrent une modale de confirmation.

### `DocAction`
Bouton `--glass-action`, rayon 14px, padding `16px 20px`, point lumineux et libellé (« Analyser mon CV »). Il lance la demande dans l'Assistant.

### `DocGroup` / `DocRow`
Panel titré en serif 21px (Personnel, Projets). Chaque ligne affiche un tag de type en mono 9px (PDF, DOC, MD, FIG, WEB, bordure `rgba(L,.18)`, rayon 5px), le nom en 13,5px et une méta à droite.

### `IntegrationCard`
`--glass-1`, rayon 18px, padding 22px. Contient le nom en 15px, un `StatusBadge`, le **périmètre d'accès** en clair (12,5px) et un bouton (« Gérer les accès » en secondary, ou « Connecter » en primary). Une dernière carte en pointillés « + Connecter un service » est toujours présente. La liste est pilotée par un registre de fournisseurs : ajouter un service n'exige aucun changement d'UI.

### `PrivacyCard`
Titre en 15px, texte explicatif en 13px et valeur actuelle en mono `rgba(L,.55)` (« 12 mois », « Désactivé »).

## Feedback

### `Toast`
Fond `rgba(12,18,22,.9)`, bordure `rgba(L,.18)`, rayon 14px, padding `14px 16px`, `--shadow-2`. Contient une `MimirPresence` de 22px, un titre en 13,5px et une méta en 12px. Variante alerte : bordure `rgba(232,199,154,.26)` et signe « ! » `--caution-ink`.
Position : bas-droite sur desktop, haut sur mobile. Durée : 6 s, sauf erreur (reste jusqu'à fermeture). `role="status"`, ou `role="alert"` pour une erreur.

### `Modal`
`--overlay` à .96, bordure `.1`, rayon 20px, padding 22px, `--shadow-3`, `--scrim` derrière. Contient un titre en serif 21px, un texte en 13px et des actions alignées à droite. Le focus est piégé dans la modale, Échap la ferme et le focus revient au déclencheur.

### Loaders
- **Pendant une demande, le loader est l'avatar lui-même** (Thinking / Processing). Ne jamais afficher de spinner sur l'écran Assistant.
- `ArcSpinner` de 28px : bordure de 1px `rgba(L,.14)`, haut `--light`, 1,2 s. Pour les chargements locaux du Workspace.
- `Skeleton` : fond `rgba(255,255,255,.06)`, rayon 5px, pulsation d'opacité .45 → 1 sur 1,8 s.
- `VoiceBars` : voir plus haut.

### États vides
**[OUVERT]** : non maquettés. Recommandation : une `MimirPresence` de 44px, une phrase de Mímir en serif 20px et une action primaire. Pas d'illustration.
