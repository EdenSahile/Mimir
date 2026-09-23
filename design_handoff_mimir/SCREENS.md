# Écrans

Layout, structure et copy d'interface : **[EXACT]**. Données : **[SIMULÉ]**, avec un persona fictif, Léa Marchand, product designer freelance.
Référence : `reference/Mímir.dc.html`. Toutes les données affichées sont dynamiques : rien de propre à un utilisateur ne doit être codé en dur.

Breakpoints : **mobile < 760px** · desktop ≥ 760px · en-tête complet ≥ 1100px · panneaux ambiants de l'Assistant ≥ 1180px.

---

## 1. Landing

- **But** : présenter Mímir comme une présence, avant toute fonctionnalité.
- **Layout** : pleine hauteur, padding `34px clamp(24px,5vw,80px) 48px`.
  - En-tête : wordmark à gauche. À droite, les liens Produit, Mémoire et Confidentialité (masqués sur mobile) et le bouton secondary « Entrer ».
  - Corps : grille `auto-fit minmax(300px,1fr)`.
    - Colonne gauche, 540px au maximum : kicker en mono « Assistant personnel · présence contextuelle », H1 display « Une intelligence qui connaît votre contexte. », paragraphe en body-l, boutons « Faire connaissance » (primary, vers l'onboarding) et « Voir l'assistant » (secondary), puis 3 tags mono (« Mémoire contrôlable », « Projets vivants », « Intégrations »).
    - Colonne droite : `MimirAvatar` hero de 400px, qui passe seul d'un état à l'autre.
  - Pied : 3 colonnes séparées de 1px (Présence, Contexte, Contrôle), fond `.028`, rayon 16px.
- **Motion** : colonne gauche en `rise` de 900ms, avatar en `fade` de 1,6 s.
- **Mobile** : une seule colonne, l'avatar passe sous le texte.

## 2. Onboarding

- **But** : Mímir fait connaissance. 5 questions, une par écran.
- **Layout** : grille `auto-fit minmax(320px,1fr)`. À gauche, `MimirAvatar` companion (290px), le wordmark et une phrase rassurante. À droite, 560px au maximum :
  - progression : 5 traits de 2px, l'actif fait 22px de large et les autres 6px, plus le compteur mono « 2 / 5 » ;
  - la question : kicker « Étape N · Thème », question en serif, aide en 15px ;
  - la réponse : `TextField` ou `Chip`s à choix multiple ;
  - « Continuer » (primary) et « Passer » (lien).
- **Questions** : Identité (prénom), Activité (texte libre), Objectifs (6 chips), Intérêts (6 chips), Usage (4 chips, qui règlent le niveau d'initiative de Mímir). Les libellés sont dans le prototype.
- **État de l'avatar** : il suit l'étape (idle, listening, thinking, processing, responding).
- **Fin** : « Entrer dans Mímir » mène à l'Assistant.
- **[SIMULÉ]** : rien n'est sauvegardé. **[À IMPLÉMENTER]** : chaque réponse crée des entrées de Mémoire avec la source « Onboarding ».
- **[OUVERT]** : ajouter une étape « Projets importants » ou la laisser à la conversation.

## 3. Assistant (écrans 3 à 9 : Idle, Listening, Thinking, Processing, Responding, Success)

- **But** : parler à Mímir. C'est l'écran central du produit.
- **Layout** : sous l'en-tête, une **scène** en colonne flex, `flex: 1 1 0; min-height: 0; overflow: hidden; justify-content: safe center`. La page ne défile jamais. Ordre vertical :
  1. `RequestEcho` (si une demande est en cours) ;
  2. **`MimirAvatar` stage**, seul élément flexible (voir `MIMIR_AVATAR.md` §8) ;
  3. `VoiceBars` (22px) ;
  4. `StateLabel` ;
  5. `SourceChips` (en Processing) ;
  6. greeting (en idle, sans demande) : « Bonjour Léa. » en serif, plus une phrase contextuelle masquée si vh < 700 ;
  7. `SpokenResponse` et `SuccessPill` ;
  8. `Composer`, ancré en bas, avec `SuggestionChips` et le bouton « Fil de l'échange ».
- **Panneaux ambiants** (≥ 1180px, en idle uniquement) : en haut à gauche « Aujourd'hui » (3 événements, heure en mono) ; en haut à droite « Contexte actif » (chips). Opacité .82. Ils disparaissent dès qu'une demande commence.
- **ThreadDrawer** : s'ouvre par-dessus la droite de la scène.
- **Flux [SIMULÉ]** : envoi → listening 1 s → thinking 1,2 s → processing 1,5 s (4 sources, +320ms chacune) → responding (55ms par mot) → success 600ms après la fin → idle 2,8 s plus tard. En production : `MIMIR_AVATAR.md` §6.
- **Mobile** : l'en-tête montre le wordmark et les initiales. La scène est la même, avec un espace de 84px réservé en bas. L'avatar fait environ 296px de haut sur 390×844. Pas de ModeToggle dans l'en-tête : **[OUVERT]**, le placer dans le composer ou dans une feuille.

## 10. My Day

Le Workspace suit toujours cet ordre : `ModuleHeader`, `InsightCard`, puis les données.

- `InsightCard` pleine largeur : lecture de la journée par Mímir.
- Grille de 3 `Panel`s :
  - **Priorités** : 3 `PriorityItem` ;
  - **Agenda** : lignes avec l'heure en mono sur 52px, le titre et la méta ; un créneau libre porte une suggestion de Mímir ;
  - **Rappels & signaux** : échéances, alertes Job Watch, activité GitHub.
- Ce n'est pas un calendrier : 3 à 5 éléments par panel au maximum, le reste est accessible par Mímir.

## 11. Projets

Liste de `ProjectRow`. Un clic ouvre le détail. **[OUVERT]** : la création d'un projet et les filtres.

## 12. Détail projet

- Barre supérieure : bouton « ← Projets », puis les onglets Vue d'ensemble, Tâches, Documents et Historique. Ce sont des libellés dans le prototype. **[À IMPLÉMENTER]** : des onglets réels.
- Grille de 3 panels :
  - **Objectifs**, chacun avec une barre de progression ;
  - **Tâches**, avec case à cocher, texte barré si fait, échéance en mono ;
  - **Documents liés** (tags) et **Connecté** (GitHub, Calendar, Notion).
- InsightCard pleine largeur « Ce que Mímir en retient ».
- Pas de tableau kanban, pas de sprint, pas d'assignation : ce n'est pas Jira.

## 13. AI News

`InsightCard` (synthèse de la semaine), puis 3 `NewsItem` au maximum par défaut. **[OUVERT]** : l'accès à l'archive, qui passerait par Mímir (« Montre-m'en plus »).

## 14. Job Watch

- `InsightCard`.
- Ligne de **critères** (chips) avec un bouton « Ajuster » en pointillés.
- `JobItem`s, triés par affinité.
- Panel **Candidatures** : 4 `PipelineStat` (envoyées, en discussion, sauvegardées, réponse attendue).
- Ce n'est pas un job board : Mímir trie et commente.

## 15. Mémoire

- `InsightCard` : ce qui reste à relire.
- Grille de 4 `MemoryGroup`.
- Bandeau final : « Mímir ne mémorise rien sans trace… », avec « Exporter ma mémoire » (secondary) et « Tout effacer » (destructive, confirmation obligatoire).
- **[À IMPLÉMENTER]** : un état « à confirmer » pour les faits appris en conversation.

## 16. Documents

- Rangée de `DocAction`s en tête : l'usage passe avant le stockage.
- 2 `DocGroup`s, Personnel et Projets.
- **[OUVERT]** : l'upload (glisser-déposer sur toute la vue ou bouton) et l'aperçu d'un document.

## 17–18. Réglages / Intégrations / Confidentialité

- `Segmented` : Profil · Intégrations · Confidentialité.
- **Profil** : un panel identité (avatar à initiales de 54px, nom, activité, champs en lecture) et un panel Préférences (4 `Toggle`s : résumé du matin, suggestions proactives, notifications le soir, animations réduites). « Animations réduites » pilote `intensity` et les boucles.
- **Intégrations** : grille de `IntegrationCard` et une carte « + Connecter un service ».
- **Confidentialité** : 3 `PrivacyCard` (ce que Mímir peut lire, conservation, entraînement).
