# Charte graphique et d'interface — Mímir

**Document de référence visuelle**  
**Version :** 1.0 · **Date :** 10 octobre 2026 · **Statut :** consolidation des références existantes

> Cette charte décrit comment Mímir doit se présenter et se comporter visuellement. Elle complète le [PRD fonctionnel](PRD.md) : le PRD définit ce que le produit doit permettre ; cette charte définit le langage visuel et les règles d'interface. Les valeurs précises et les prototypes du dossier `design_handoff_mimir/` font foi lorsqu'ils sont plus détaillés.

## 1. Identité

### Idée centrale

Mímir est une **présence attentive, calme et contextuelle**. L'interface évoque une intelligence disponible qui écoute et travaille, sans reprendre les codes d'un tableau de bord d'entreprise ni ceux d'un chatbot à bulles.

### Principes visuels

- La présence de Mímir est le premier repère de l'Assistant ; le texte accompagne l'avatar.
- L'interface reste calme, lisible et dense juste ce qu'il faut pour un usage quotidien.
- Les données structurées se consultent dans le Workspace ; chaque module conserve une interprétation de Mímir en tête.
- Les effets lumineux indiquent un état ou une action. Ils ne remplacent jamais un libellé.
- Le contrôle, la confidentialité et la réduction du mouvement font partie du langage du produit.

## 2. Éléments de référence

Les règles marquées **EXACT** sont les valeurs visuelles attendues. Les éléments **SIMULÉS** des prototypes illustrent l'apparence mais ne décrivent pas une logique fonctionnelle. Les éléments **À IMPLÉMENTER** prévoient une capacité future ; ils ne doivent pas être présentés comme livrés. Les sujets **OUVERTS** restent à décider.

- Tokens complets : [`../design_handoff_mimir/TOKENS.md`](../design_handoff_mimir/TOKENS.md) et [`../design_handoff_mimir/tokens.css`](../design_handoff_mimir/tokens.css).
- Écrans et breakpoints : [`../design_handoff_mimir/SCREENS.md`](../design_handoff_mimir/SCREENS.md).
- Composants et états : [`../design_handoff_mimir/COMPONENTS.md`](../design_handoff_mimir/COMPONENTS.md).
- Navigation, responsive et accessibilité : [`../design_handoff_mimir/BEHAVIOR.md`](../design_handoff_mimir/BEHAVIOR.md).
- Avatar : [`../design_handoff_mimir/MIMIR_AVATAR.md`](../design_handoff_mimir/MIMIR_AVATAR.md).
- Prototypes de référence : `../design_handoff_mimir/reference/`.

Les prototypes sont des références visuelles et comportementales. Leur runtime, leurs données fictives, styles inline et temporisations de démonstration ne sont pas à porter en production.

## 3. Couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Fond principal | `#04060A` (`--void`) | Fond persistant de toutes les vues. |
| Fonds voisins | `#05080C`, `#030508` | Profondeur discrète du fond. |
| Encre forte | `#EFF6F7` | Titres et parole de Mímir. |
| Encre courante | `#E6EEF0` | Texte principal. |
| Lumière froide | `#CEF4F8` | Accent, focus, navigation active et présence. |
| Lumière au survol | `#EAFBFD` | Texte actif et liens au survol. |
| Lumière chaude | `#EEF2E4` | État Responding de l'avatar uniquement. |
| Attention | `#E8C79A` | Échéance et alerte douce. |
| Danger | `#ECC4B0` | Actions destructives et confirmation. |

La palette complète des surfaces, transparences et contrastes est définie dans `TOKENS.md`. Une seule couleur d'accent froide domine l'interface ; le chaud reste réservé à la prise de parole. Aucun texte informatif ne descend sous le contraste spécifié (4,5:1 pour le texte courant). La couleur n'est jamais l'unique moyen de transmettre un état.

## 4. Typographie

| Famille | Rôle |
|---|---|
| Instrument Serif | Titres, questions, salutations, réponse de Mímir et interprétations des modules. |
| DM Sans | Navigation, boutons, champs, descriptions et texte courant. |
| JetBrains Mono | État de l'assistant, heures, compteurs et libellés système. |

La hiérarchie détaillée (tailles, interlignes et usages) reste celle de `TOKENS.md`. Les titres utilisent `text-wrap: pretty`. Le texte courant ne descend pas sous 14px ; les métadonnées ne descendent pas sous 12px et les petits libellés mono sous 9,5px. N'utiliser ni graisses lourdes ni serif gras.

## 5. Surfaces et formes

- Les panels et cartes de contenu emploient le verre très discret (`--glass-1`) ; l'InsightCard reçoit une légère lumière (`--glass-light`).
- Les surfaces superposées restent limitées à deux couches ; les lignes dans un panneau utilisent des séparateurs, pas des cartes imbriquées.
- Les champs sont faciles à identifier et leur focus est visible.
- Rayons de référence : 5px pour badges, 8px pour tags de document, 14px pour champs, 18px pour panels et jusqu'à 22px pour surfaces flottantes. Boutons, chips et composer utilisent la forme pilule lorsque spécifié.
- Les ombres et halos servent à détacher un élément interactif ou la présence de l'avatar ; ils ne décorent pas chaque surface.

Les valeurs RGB/alpha, ombres et rayons complètes sont dans `TOKENS.md`.

## 6. Avatar et mouvement

L'avatar est la représentation de Mímir, pas une décoration ajoutée à un chatbot. Le composant sépare le média (placeholder aujourd'hui, média final à choisir) de la présence lumineuse. Le remplacement du média ne doit pas imposer la réécriture des écrans.

Six états ont une signification distincte :

| État | Sens pour l'utilisateur |
|---|---|
| Idle | Mímir est présent et disponible. |
| Listening | Mímir reçoit la demande ou la voix. |
| Thinking | Mímir réfléchit à la demande. |
| Processing | Mímir consulte des sources ou utilise un outil. |
| Responding | Mímir formule sa réponse ; la teinte devient plus chaude. |
| Success | L'action est terminée. |

Le mouvement doit rester lent et mesuré. Il suit les durées et transitions des tokens et la spécification `MIMIR_AVATAR.md`. Pas de spinner sur l'Assistant : l'état Thinking/Processing de l'avatar indique le travail. Pour les préférences de mouvement réduit, les boucles sont arrêtées ou atténuées, les transitions deviennent un fondu court et la réponse s'affiche sans révélation mot à mot.

## 7. Structure des expériences

### Landing

Présenter la promesse, le mot-symbole et la présence de l'avatar avant les détails fonctionnels. L'action principale mène à la découverte/onboarding, l'action secondaire à une vue de l'Assistant. En mobile, le contenu se replie en une colonne.

### Onboarding

Une question par écran avec progression claire, réponse saisissable ou sélectionnable, possibilité de continuer ou passer. L'avatar accompagne le parcours sans détourner l'attention des champs.

### Assistant

La scène est centrée et ne défile pas en tant que page. Ordre général : demande, avatar, indicateur vocal, libellé d'état, sources éventuelles, réponse, résultat et composer ancré en bas. La réponse peut défiler dans sa propre zone. **Pas de bulles de chat.** Le fil complet s'ouvre dans un tiroir.

### Workspace

Une navigation stable relie les modules : My Day, Projets, AI News, Job Watch, Mémoire, Documents et Réglages. Chaque écran présente un titre de module et une interprétation de Mímir avant les données lorsque le module en prévoit une. Les panels servent à grouper des contenus ; ne pas transformer chaque section de page en carte.

### Mobile

Sous 760px, navigation par barre basse, avec la présence Mímir au centre et les modules secondaires dans une feuille « Plus ». Cibles tactiles d'au moins 44px. Le composer reste visible et le visage ne se retrouve pas sous les contrôles.

## 8. Composants et langage d'interaction

- Un seul bouton primaire par vue ; les commandes dangereuses sont identifiables et confirmées.
- Utiliser des boutons pour les actions, des champs pour le texte, des chips pour les choix et les contrôles segmented pour les modes/onglets.
- La navigation active combine texte et repère visuel ; ne jamais dépendre de la couleur seule.
- Les messages de réussite et d'erreur sont explicites. Une erreur persistante reste affichée jusqu'à ce qu'elle soit résolue ou fermée.
- Les chargements du Workspace utilisent skeleton ou indicateur local ; l'Assistant utilise les états de Mímir.
- Le prototype peut forcer un état d'avatar pour revue visuelle ; le sélecteur de démonstration ne fait pas partie de l'interface utilisateur livrée.

Les API détaillées de `Button`, `TextField`, `Toggle`, `Chip`, `Segmented`, `NavRail`, `BottomBar`, `InsightCard`, `ThreadDrawer`, `Composer` et des autres éléments restent dans `COMPONENTS.md`.

## 9. Accessibilité

Exigences obligatoires :

- Focus clavier visible et conservé ; ordre de tabulation logique ; Échap ferme tiroirs, feuilles et modales.
- Libellé textuel des états de Mímir annoncé poliment par lecteur d'écran ; l'avatar décoratif est masqué à l'arbre d'accessibilité.
- Réponse parlée également disponible en texte complet.
- Contraste du texte conforme aux seuils définis dans les tokens.
- `aria-current`, `aria-live`, rôles de dialogue et états `aria-checked`/`aria-pressed` employés selon le contrôle.
- Respect de `prefers-reduced-motion` et d'un réglage équivalent dans le produit.
- Taille minimale des textes et cibles tactiles respectée sur toutes les vues.

Les règles détaillées et leur comportement clavier sont spécifiés dans `BEHAVIOR.md` §5.

## 10. Ton de l'interface

Mímir s'exprime avec calme, précision et chaleur légère. Il est concis quand la demande est simple, explicite ses hypothèses quand elles influencent le résultat et reconnaît quand il ne sait pas. Il ne prétend pas avoir consulté une source ni effectué une action sans preuve de réussite.

Les libellés doivent être directs et compréhensibles. Éviter le jargon dans l'interface, les promesses grandioses, la personnification insistante et les explications techniques sans utilité pour la décision de l'utilisateur.

## 11. États à concevoir avant production

Les références signalent plusieurs écrans ou états qui restent ouverts. Ils devront être dessinés ou validés avant leur implémentation :

- aucun projet, document, souvenir, résultat d'actualité ou offre disponible ;
- erreur réseau, réponse IA interrompue, service tiers expiré ;
- détail d'un document et ajout d'un projet ;
- confirmation de suppression d'un souvenir, d'un fichier ou du compte ;
- permissions refusées ou intégration partiellement connectée ;
- affichage tablette portrait et comportement lorsque l'avatar n'est pas chargé.

Ne pas inventer une variante visuelle incompatible : compléter les prototypes et leurs spécifications en conservant les tokens et principes ci-dessus.

## 12. Points graphiques à décider

- Apparence finale du média/avatar (image, vidéo, rig 3D ou fournisseur temps réel).
- Choix de la voix et cohérence visuelle avec le mode vocal.
- Comportement tablette portrait.
- Apparence du thème clair, s'il devient nécessaire ; aucun thème clair n'est défini actuellement.
- Direction de l'identité si l'application évolue vers d'autres marques ou environnements.

## 13. Validation d'un écran

Un écran est conforme si :

1. Il utilise les tokens et composants de référence sans introduire une palette parallèle.
2. Sa hiérarchie rend évident le contenu principal et l'action suivante.
3. Ses états vide, chargement, succès et erreur sont compréhensibles.
4. Il fonctionne sur les breakpoints documentés et ne masque aucun contenu ou contrôle.
5. Il reste utilisable au clavier, par lecteur d'écran et avec mouvement réduit.
6. Les données présentées comme personnelles sont réelles et propres à l'utilisateur, jamais les données fictives du prototype.

## 14. Références

- [PRD fonctionnel](PRD.md)
- [Handoff de design et statut des références](../design_handoff_mimir/README.md)
- [Tokens détaillés](../design_handoff_mimir/TOKENS.md)
- [Comportement et accessibilité](../design_handoff_mimir/BEHAVIOR.md)
