# Handoff : MÍMIR — assistant IA personnel incarné

## Vue d'ensemble

Mímir est un assistant IA personnel multi-utilisateur. Sa particularité produit : **l'assistant est incarné par un avatar (`MimirAvatar`)** qui écoute, réfléchit, traite et répond. Le texte accompagne l'avatar, il ne le remplace jamais. L'application a deux modes : **Assistant** (immersif, centré sur l'avatar) et **Workspace** (modules de données : My Day, Projets, AI News, Job Watch, Mémoire, Documents, Réglages).

Stack cible : React + Vite + TypeScript, Node/Express, Prisma, PostgreSQL, Claude API.

## À propos des fichiers de design

Les fichiers de `reference/` sont des **références de design créées en HTML** : des prototypes qui montrent l'apparence et le comportement attendus, **pas du code de production à copier**. La tâche est de **recréer ces designs en React + TypeScript**, avec des composants propres, typés et testables. Le code des prototypes (runtime de composants, styles inline, données codées en dur, `setTimeout` qui simulent la conversation) ne doit pas être repris tel quel.

## Fidélité

**Haute fidélité.** Couleurs, typographie, espacements, rayons, surfaces et états sont finaux. Recréer l'UI au pixel près. Seul l'avatar lui-même (le visage) est un placeholder : voir `MIMIR_AVATAR.md`.

## Documents de ce dossier

| Fichier | Contenu |
|---|---|
| `README.md` | Ce fichier : vue d'ensemble, écrans, statut de chaque élément |
| `TOKENS.md` | Design tokens (couleurs, contrastes, typo, surfaces, ombres, lumière, rayons, espacements, motion) |
| `tokens.css` | Les mêmes tokens en variables CSS, prêts à importer |
| `COMPONENTS.md` | Composants réutilisables : API, variantes, états |
| `MIMIR_AVATAR.md` | Spécification complète de `MimirAvatar` : API, 6 états, transitions, tailles, déclencheurs, lip-sync, remplacement du placeholder |
| `SCREENS.md` | Écran par écran : layout, composants, interactions, responsive |
| `BEHAVIOR.md` | Machine d'état de conversation, navigation Assistant ↔ Workspace, responsive, accessibilité |
| `reference/` | Prototypes HTML (ouvrir `Mímir.dc.html` et `Design System.dc.html` dans un navigateur) |
| `screenshots/` | Références visuelles (voir section ci-dessous) |

## Statut de chaque élément

Chaque document utilise ces quatre étiquettes. Elles indiquent ce que Claude Code doit faire de l'élément.

- **[EXACT]** — À reproduire exactement : valeurs, layout, copy d'interface, comportements visuels.
- **[SIMULÉ]** — Comportement faux dans le prototype (timers, données fictives, réponses en dur). À remplacer par la vraie logique ; l'effet visuel reste [EXACT].
- **[À IMPLÉMENTER]** — Capacité technique future (voix, lip-sync, avatar animé, intégrations OAuth). L'interface la prévoit déjà ; le branchement viendra plus tard.
- **[OUVERT]** — Décision volontairement non tranchée. Ne pas inventer : laisser un point d'extension et demander.

### Synthèse

**[EXACT]**
- Tous les tokens de `TOKENS.md`.
- Layout de chaque écran (`SCREENS.md`), desktop et mobile.
- Structure de l'écran Assistant : demande au-dessus de l'avatar, avatar, barres vocales, libellé d'état, sources, réponse en serif, composer ancré en bas. Pas de bulles de chat.
- Les 6 états de `MimirAvatar` et leurs signaux visuels (lumière, regard, bouche, balayage, ondes, particules).
- Navigation : rail texte desktop, barre basse mobile avec Mímir au centre, ModeSwitch Assistant/Workspace.
- Règles d'accessibilité (`BEHAVIOR.md` §5).

**[SIMULÉ]**
- Enchaînement des états pendant une demande (timers fixes : 1 s écoute, 1,2 s réflexion, 1,5 s traitement).
- Réponse de Mímir (texte codé en dur, révélé à 55 ms/mot).
- Sources qui s'allument pendant Processing (liste fixe).
- Toutes les données (persona « Léa Marchand », projets, offres, actualités, mémoire, documents).
- Push-to-talk : n'enregistre rien, bascule l'état seulement.
- Sélecteur « État · démo » dans l'en-tête : outil de revue, **à retirer en production**.
- Onboarding : les réponses ne sont pas sauvegardées.
- Boutons Workspace (Sauvegarder, Adapter mon CV, Modifier, Oublier, Connecter…) : visuels uniquement.

**[À IMPLÉMENTER]**
- Machine d'état de conversation pilotée par le micro, le stream Claude et les `tool_use` (`BEHAVIOR.md` §1).
- Voix (STT à l'entrée, TTS à la sortie) et `amplitude` reliée au niveau audio.
- Avatar animé qui remplace le placeholder, sans toucher au reste de l'interface (`MIMIR_AVATAR.md` §7).
- Persistance : utilisateurs, mémoire, projets, documents (Prisma/PostgreSQL).
- Intégrations OAuth (Google Calendar, Gmail, GitHub, Notion, Slack…).
- Historique réel de la conversation dans le ThreadDrawer.

**[OUVERT]**
- Apparence définitive de l'avatar (render, vidéo, rig 3D temps réel, fournisseur d'avatar).
- Fournisseur voix (TTS/STT) et choix de la voix.
- Mode mains libres / mot d'éveil vs push-to-talk seul.
- Sous-titres synchronisés mot à mot sur le TTS ou révélation par tokens.
- Écrans non maquettés : détail d'une offre, détail d'un document, ajout d'un projet, états d'erreur réseau, états vides des modules.
- Tablette : règles déduites (voir `BEHAVIOR.md` §4), pas de maquette dédiée.
- Thème clair : non prévu.

## Références visuelles (`screenshots/`)

```
screenshots/
├── desktop/        viewport 924×540 (petit laptop), captures « haut » et « bas » pour les pages longues
│   ├── 01-landing · 02-onboarding-etape1 · 03-onboarding-etape3-choix
│   ├── 10-assistant-idle · 11-listening · 12-thinking · 13-processing · 14-responding · 15-success
│   ├── 20/21-myday · 22/23-projets · 24/25-projet-detail · 26/27-ai-news · 28/29-job-watch
│   └── 30/31-memoire · 32/33-documents · 34-reglages-profil · 35-reglages-integrations · 36-reglages-confidentialite
├── mobile/         390×540 (téléphone court, cas le plus contraint)
│   ├── 01-landing · 02-onboarding · 03-assistant-idle · 04-processing · 05-responding · 06-success
│   └── 07-myday · 08-projets · 09-documents · 10-menu-plus · 11-ai-news · 12-job-watch · 13-memoire · 14-reglages
├── avatar/         MimirAvatar seul (playground du Design System), les 6 états
│   └── 01-idle · 02-listening · 03-thinking · 04-processing · 05-responding · 06-success
└── design-system/  sections du Design System (intro avatar, props & anatomie, motion, couleurs, conversation)
```

À lire avec ces précautions :
- **Les captures sont des images fixes.** Le mouvement (respiration, arcs, ondes, révélation du texte) n'y apparaît pas : la référence du mouvement est le prototype et `MIMIR_AVATAR.md`.
- **Le moteur de capture simplifie certains effets.**
  - L'arche du cadre de l'avatar apparaît parfois rectangulaire.
  - Le fondu bas du portrait apparaît parfois comme une bande nette.
  - Les flous (`backdrop-filter`) sont atténués.
  - En cas de doute, la valeur de référence est dans `TOKENS.md` (`--r-avatar`), et le prototype ouvert dans un navigateur fait foi.
- **Les états de l'Assistant ont été forcés** avec le sélecteur « État · démo », qui apparaît dans l'en-tête des captures. Ce sélecteur est à retirer en production.
- **La mise en page mobile a été simulée** dans une colonne de 390px. Les barres de défilement grises visibles sur certaines captures mobiles sont un artefact de capture.
- **Aucun render d'avatar n'est déposé** : toutes les captures montrent la silhouette placeholder, volontairement.
- **Les données sont fictives** (persona Léa Marchand).

## Assets

- **Polices (Google Fonts)** : Instrument Serif 400 (+ italique), DM Sans 300/400/500 (axe opsz 9–40), JetBrains Mono 400/500.
- **Avatar** : aucun asset final. Le prototype affiche une silhouette lumineuse en CSS et accepte un render déposé (portrait 4:5, visage centré à ~34 % de la hauteur, fond sombre). Voir `MIMIR_AVATAR.md` §7.
- **Icônes** : aucune bibliothèque d'icônes. La navigation est en texte seul ; les statuts utilisent des signes typographiques (● ‖ ! ✓ +). Le seul pictogramme est le micro (rectangle arrondi 13×21px, contour 1.5px).
- Aucune image tierce.

## Fichiers de référence

- `reference/Mímir.dc.html` — prototype navigable complet (Landing → Onboarding → Assistant → Workspace), desktop et mobile (< 760px).
- `reference/Design System.dc.html` — design system vivant, avec playground `MimirAvatar`.
- `reference/MimirAvatar.dc.html` — le composant avatar, avec ses 6 états.
- `reference/image-slot.js`, `reference/support.js` — runtime du prototype. **Ne pas porter.**
