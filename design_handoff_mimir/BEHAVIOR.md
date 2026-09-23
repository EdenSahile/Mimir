# Comportement, navigation, responsive, accessibilité

## 1. État applicatif

```ts
interface MimirUIState {
  mode: 'assistant' | 'workspace';
  route: 'landing' | 'onboarding' | 'assistant' | 'myday' | 'projects' | 'project/:id'
       | 'news' | 'jobs' | 'memory' | 'documents' | 'settings/:tab';
  conversation: {
    state: MimirState;               // voir MIMIR_AVATAR.md §6
    amplitude: number;               // ref + rAF, pas dans le store React à 60 fps
    request?: string;
    response?: { text: string; revealed: number };
    sources: { id: string; label: string; active: boolean }[];
    success?: { text: string; href?: string };
    thread: { role: 'user' | 'mimir'; text: string; at: string }[];
    inputMode: 'text' | 'voice';     // préférence persistée
  };
}
```

- `conversation.state` est **global**. La `MimirPresence` du Workspace et de la barre mobile le reflète, même hors de l'Assistant. On peut lancer une demande, aller dans le Workspace et voir Mímir continuer à travailler.
- Routes suggérées : `/`, `/welcome`, `/mimir`, `/day`, `/projects`, `/projects/:id`, `/news`, `/jobs`, `/memory`, `/documents`, `/settings/:tab`.

## 2. Navigation Assistant ↔ Workspace

Les deux modes sont **un seul produit** : même fond ambiant, même en-tête, même rail, même lumière.

| Action | Résultat |
|---|---|
| ModeSwitch « Workspace » | Ouvre My Day (ou le dernier module visité **[OUVERT]**) |
| ModeSwitch « Assistant », élément de rail « Mímir », présence centrale mobile | Ouvre l'Assistant avec la conversation en cours intacte |
| « Demander à Mímir » dans un module | Ouvre l'Assistant. **[À IMPLÉMENTER]** : injecter le contexte du module (« À propos de Job Watch… ») |
| `DocAction`, « Adapter mon CV », suggestion | Ouvre l'Assistant et lance la demande correspondante |
| « Ouvrir » dans une SuccessPill | Ouvre le module concerné |

**Transition [EXACT] :**
- **Assistant → Workspace (900ms, `--ease-presence`)** :
  - le contenu du Workspace entre en `rise` (14px, fondu) ;
  - chaque module rejoue son entrée (600ms, 120ms de délai) à chaque changement de module ;
  - l'avatar disparaît et Mímir reste présent sous forme de `MimirPresence` dans le bouton « Demander à Mímir ».
- **Workspace → Assistant** : la scène est remontée, l'avatar entre en `fade`.
- **[À IMPLÉMENTER], recommandé** : une transition partagée (View Transitions API, ou FLIP avec Framer Motion `layoutId`) où la `MimirPresence` du header se déploie en `MimirAvatar` stage. Le prototype n'a qu'un fondu simple.

## 3. Interactions clés

| Élément | Interaction |
|---|---|
| Composer texte | Entrée envoie. Un envoi vide ne fait rien |
| Micro | Clic : passe en listening. Second clic : envoie. **[À IMPLÉMENTER]** : Espace maintenu = push-to-talk, relâché = envoi |
| Suggestion | Envoie son texte comme demande |
| Fil de l'échange | Bascule le ThreadDrawer. Échap le ferme |
| ProjectRow | Ouvre le détail |
| Toggle | Bascule, et persiste en production |
| Plus (mobile) | Ouvre ou ferme la MoreSheet. Un tap sur le fond la ferme |
| Oublier / Tout effacer | Modale de confirmation obligatoire |
| Sélecteur « État · démo » | **Prototype uniquement.** Force un état de l'avatar pour la revue |

## 4. Responsive

| Plage | Règles |
|---|---|
| **< 760px (mobile)** | Pas de rail : `BottomBar` avec Mímir au centre et `MoreSheet`. L'en-tête montre le wordmark et les initiales. Pas de ModeSwitch (la BottomBar le remplace), pas de sélecteur d'état. Contenu en une colonne, padding 20px. L'Assistant garde la même structure verticale, l'avatar reste le seul élément flexible et un espace de 84px est réservé en bas. Suggestions : 3 maximum. Cibles tactiles de 44px minimum |
| **760–1099px (tablette / petit laptop)** | Rail de 190px, ModeSwitch, pas d'horloge ni de nom dans l'en-tête. Pas de panneaux ambiants dans l'Assistant. Suggestions : 3 si < 1000px. **[OUVERT]** : un rail réduit à 64px pour la tablette portrait |
| **1100–1179px** | En-tête complet |
| **≥ 1180px** | Panneaux ambiants « Aujourd'hui » et « Contexte actif » dans l'Assistant, en idle |
| **Hauteur < 700px** | Phrase du greeting masquée |
| **Hauteur < 640px** | Libellé « Votre demande » masqué, « Déposer un render » masqué, avatar à 120px minimum pendant une demande |

Invariants, quelle que soit la taille :
- La page Assistant ne défile jamais.
- Le composer est toujours visible.
- L'avatar ne descend jamais sous son minimum.
- La réponse est ce qui cède en premier : elle défile dans sa propre zone.

## 5. Accessibilité — **[EXACT]**, non négociable

1. **Contraste** : texte ≥ 4.5:1. Aucune encre sous 0.55 d'opacité sur `--void`. Titres serif ≥ 3:1.
2. **Focus visible partout** : contour de 1px `rgba(L,.75)`, décalé de 3px, via `:focus-visible`. Ne jamais le retirer.
3. **Clavier** :
   - Tab parcourt rail, en-tête, contenu et composer, dans cet ordre.
   - Entrée envoie. Espace maintenu sur le micro = push-to-talk.
   - Échap ferme le tiroir, la modale et la feuille.
   - Les flèches naviguent dans les Segmented.
4. **État de Mímir** : toujours écrit (`StateLabel`) et annoncé en `aria-live="polite"`. L'avatar a `aria-hidden`.
5. **Voix** : toute réponse dite est aussi écrite en entier. Le ThreadDrawer sert de transcription complète.
6. **Mouvement réduit** (`prefers-reduced-motion` ou réglage utilisateur) :
   - boucles arrêtées, `intensity` à 0.4 ;
   - transitions remplacées par un fondu de 150ms ;
   - texte affiché d'un bloc (pas de révélation mot à mot) ;
   - cycle automatique de la landing désactivé.
7. **Couleur jamais seule** : statuts avec signe et mot, progression avec %, priorités avec ordre et couleur.
8. **Tailles** : texte courant ≥ 14px, métadonnées ≥ 12px, libellés mono ≥ 9.5px. Les tailles clamp ne descendent jamais sous ces seuils.
9. **Structure** :
   - un `h1` par vue (titre de module, ou greeting visuellement masqué dans l'Assistant **[À IMPLÉMENTER]**) ;
   - `nav` avec `aria-current="page"` ;
   - `main` ;
   - modales avec `role="dialog"`, `aria-modal` et un titre relié.
10. **Toggles et chips** : `role="switch"` / `aria-checked` ; `aria-pressed` pour les chips.

## 6. Données

Toutes les entités sont par utilisateur et dynamiques : User, Preference, MemoryItem (fait, catégorie, source, date, statut confirmé ou à confirmer), Project (objectifs, tâches, documents, liens, intégrations), Document (catégorie Personnel/Projet, type, projectId?), Integration (fournisseur, scopes, statut), NewsItem (et sa raison de pertinence), JobOffer (affinité, note), Application, Conversation/Message.

Le design ne suppose ni un nombre fixe de projets ou d'intégrations, ni des noms particuliers.
