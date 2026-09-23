# MimirAvatar — spécification

`MimirAvatar` **est** Mímir. C'est le composant le plus important du produit.

Référence vivante :
- `reference/MimirAvatar.dc.html`, le composant seul.
- `reference/Design System.dc.html`, section 01, avec un playground où l'on règle `state`, `amplitude` et `intensity`.

## 1. Principe d'architecture

Le composant est séparé en deux parties.

1. **Le média**, dans le cadre portrait. Aujourd'hui c'est un placeholder. Demain ce sera une vidéo, un rig 3D ou un avatar temps réel.
2. **La présence**, autour et par-dessus le média : halo, anneaux, regard, bouche, balayage, ondes, particules.

Les deux reçoivent les **mêmes props**. Quand on remplacera le média, la présence et le reste de l'interface ne changeront pas. **[EXACT]**

L'écran ne dessine jamais d'effet d'avatar lui-même. Il passe `state` et `amplitude`, et c'est tout.

## 2. API

```ts
type MimirState = 'idle' | 'listening' | 'thinking' | 'processing' | 'responding' | 'success';

type AvatarMedia =
  | { kind: 'placeholder' }                       // silhouette lumineuse (défaut)
  | { kind: 'image'; src: string }                // render statique (prototype)
  | { kind: 'video'; src: string }                // [À IMPLÉMENTER]
  | { kind: 'rig'; driver: AvatarRigDriver };     // [À IMPLÉMENTER] 3D / temps réel

interface MimirAvatarProps {
  state: MimirState;          // requis
  amplitude?: number;         // 0–1. Absent = oscillation automatique en Responding
  intensity?: number;         // 0–1.6, défaut 1. Multiplie l'opacité de tous les effets de présence
  media?: AvatarMedia;        // défaut { kind: 'placeholder' }
  size?: 'stage' | 'hero' | 'companion' | 'presence';
  className?: string;
  'aria-hidden'?: boolean;    // l'avatar est décoratif pour les lecteurs d'écran ; l'état est annoncé ailleurs
}
```

Correspondance avec le prototype :
- `showSlot` et `slotId` n'existent que dans le prototype. En production, ils deviennent `media`.
- `showHint` (« Déposer un render ») est un outil de prototype. **Ne pas porter.**

### `state` — **[EXACT]** pour le visuel, **[À IMPLÉMENTER]** pour le pilotage

Choisit la configuration de lumière, de regard et de mouvement (§4). Un changement d'état est toujours interpolé (§5), jamais instantané.

Plus tard, `state` sera piloté par la machine d'état de conversation (§6) : micro, stream Claude, `tool_use`. Si le média est un rig, `state` deviendra aussi son paramètre d'animation principal (pose, regard, expression).

### `amplitude` — **[À IMPLÉMENTER]**

Un nombre entre 0 et 1.

Aujourd'hui, il règle la largeur de la lueur de bouche en Responding (`scaleX(max(.2, amplitude))`). S'il est absent, la bouche oscille seule (période de 420ms).

Plus tard, il recevra le **niveau audio lissé**, dans deux cas :

| État | Source de `amplitude` |
|---|---|
| Listening | Niveau RMS du micro (entrée utilisateur) → barres vocales + intensité du rim |
| Responding | Niveau RMS de la sortie TTS → ouverture de la bouche, puis visèmes |

Calcul recommandé, dans un hook `useAudioAmplitude(stream | audioElement)` :

```ts
// Web Audio API
const ctx = new AudioContext();
const src = ctx.createMediaStreamSource(stream);        // ou createMediaElementSource(audioEl)
const analyser = ctx.createAnalyser();
analyser.fftSize = 1024;
src.connect(analyser);                                  // ne pas connecter à destination pour le micro
const buf = new Float32Array(analyser.fftSize);

function tick() {
  analyser.getFloatTimeDomainData(buf);
  let sum = 0; for (const v of buf) sum += v * v;
  const rms = Math.sqrt(sum / buf.length);              // ~0–0.5
  const target = Math.min(1, rms * 4);                  // normalisation (à calibrer)
  level = level + (target - level) * (target > level ? 0.5 : 0.15); // attaque rapide, relâche lente
  setAmplitude(level);                                  // throttle ~60 fps, via ref + rAF plutôt que setState
  raf = requestAnimationFrame(tick);
}
```

Étapes du lip-sync :
- **v1** : `amplitude` pilote l'ouverture de la bouche.
- **v2** : si le fournisseur TTS renvoie des visèmes ou des timestamps de phonèmes (plusieurs le font), on passe `visemes` à un rig. `amplitude` reste utilisé pour la lumière. **[OUVERT]** : le choix du fournisseur.

### `intensity` — **[EXACT]**

Multiplie l'opacité du halo, des arcs, des ondes, des particules, du regard et de la bouche. Il ne touche jamais au média.

| Contexte | Valeur |
|---|---|
| Défaut | 1 |
| Réglage « Animations réduites » ou `prefers-reduced-motion` | 0.4 |
| Portrait seul (captures, partage) | 0 |
| Économie d'énergie / onglet en arrière-plan | 0.4, et suspendre les boucles |

## 3. Anatomie — 4 couches **[EXACT]**

Le conteneur a un ratio de **4:5**, en `position: relative`. Toutes les positions ci-dessous sont en % de ce conteneur.

| Couche | Contenu | Détail |
|---|---|---|
| 1 · Back | Halo + 2 anneaux fixes | Halo : `inset: -22% -30%`, `radial-gradient(42% 36% at 50% Y%, rgba(L, α·intensity), transparent 72%)`, respiration `scale 1→1.03` sur la durée de l'état. Anneaux : diamètres 112 % et 86 % de la largeur, centrés à `top 38%`, bordure `1px rgba(190,236,240,.09/.07)` |
| 2 · Frame | Cadre portrait + média | `left/right 13%`, `top 5%`, `bottom 3%`, `border-radius: var(--r-avatar)`, `overflow: hidden`, fond `radial-gradient(120% 80% at 50% 30%, rgba(26,40,46,.9), rgba(8,12,16,.96) 70%)`, `box-shadow: rim + --shadow-avatar` |
| 3 · Front | Regard, bouche, balayage, fondu | Regard : trait de 2px de `left 30%` à `right 30%`, à `top 33% + gazeY`. Bouche : trait de 2px de `left 42%` à `right 42%`, à `top 47%`. Fondu bas : `linear-gradient(180deg, transparent 62%, rgba(4,6,10,.85))`. Ces éléments sont **dans** le cadre (clippés) |
| 4 · Outer | Arcs, repères, ondes, particules | Arcs : conic-gradient masqué en anneau de 1–1.5px, 112 % et 86 % de la largeur, en rotation inverse l'un de l'autre. Repères : N traits de 1px en rotation. Ondes : anneaux de 70 % qui s'agrandissent (scale .55 → 1.45, opacité .55 → 0). Particules : N points de 2–3px en angle d'or, dérive de 8px verticale |

**Placeholder (silhouette)** :
- une tête radiale à `top 34%`, de 46 %×40 %, avec un flou de 2px ;
- un cou ;
- des épaules radiales à `bottom -26%` ;
- une **couture verticale** de 1px (de `top 16%` sur 40 % de hauteur), qui signale le caractère artificiel.

Dès qu'un média est chargé, la silhouette est retirée. La couche Front reste, avec regard et bouche à 45–50 % d'opacité.

**Positionnement du visage** : tout média doit placer les yeux à environ **33 %** et la bouche à environ **47 %** de la hauteur du conteneur, pour que le regard et la bouche de la couche Front coïncident avec le visage. Si le média gère lui-même le regard et la bouche (rig), passer ces deux éléments à `opacity: 0` et garder le reste.

## 4. Les 6 états

Les valeurs visuelles actuelles sont **[EXACT]**. La colonne « Avatar animé » est **[À IMPLÉMENTER]**.

| | Idle | Listening | Thinking | Processing | Responding | Success |
|---|---|---|---|---|---|---|
| **Sens** | Présent, disponible | L'utilisateur parle | Analyse la demande | Consulte des données ou outils | Parle | Action terminée |
| **Halo α / Y** | .16 / 36 % | .30 / 36 % | .34 / **22 %** (monte au-dessus de la tête) | .22 / 36 % | .40 / **44 %** (descend vers la bouche) | .30 / 36 % |
| **Teinte** | froide | froide | froide | froide | **chaude** (`--light-warm`) | froide |
| **Rim α** | .12 | .30 | .20 | .26 | .24 | flash .50 → .14 en 1,6 s (une fois) |
| **Respiration** | 8 s | 3,4 s | 2,6 s | aucune | 4,4 s | 6 s |
| **Arcs** | — | longueur .16 tour, 40 s | .42 tour, **10 s** (rapide) | — | .28 tour, 28 s | — |
| **Repères** | — | — | — | **10 traits**, 16 s, scintillement 1,4 s | — | — |
| **Ondes** | — | 2 entrantes, 3,4 s | — | — | 1, 3,4 s | **3 sortantes**, 2,2 s, décalées de .3 s |
| **Particules** | 8 | 13 | 15 | 7 | 11 | 7 |
| **Regard** | α .35, fixe | α .95, net, centré | α .5, **monte de 5 %**, balaie ±6 % en 3,2 s | **éteint** | α .75 | α .6 |
| **Bouche** | — | — | — | — | active, suit `amplitude` | — |
| **Balayage** | — | — | — | **vertical** 4 % → 92 %, 2,6 s | — | — |
| **Autour (écran)** | Greeting + suggestions | Barres vocales, demande affichée | Libellé « Réflexion » | **Sources** qui s'allument une par une | Réponse révélée mot à mot + barres vocales | SuccessPill |
| **Libellé d'état** | Présent | À l'écoute | Réflexion | Traitement des données | Réponse | Terminé |
| **Avatar animé (cible)** | Micro-mouvements de tête, clignements espacés, regard doux vers l'utilisateur | Regard fixé sur l'utilisateur, léger hochement, attention visible | Regard qui se détourne vers le haut, expression concentrée | Yeux mi-clos ou tournés vers les sources, lumière qui parcourt le visage | Lip-sync, expressions liées au contenu, regard vers l'utilisateur | Léger sourire, hochement, retour au calme |

Chaque état se distingue au moins par la **forme** ou le **mouvement**, pas seulement par la lumière :
- Listening : ondes entrantes.
- Thinking : halo haut et arcs rapides.
- Processing : repères et balayage.
- Responding : chaleur et bouche.
- Success : ondes sortantes et flash.

Le libellé écrit est toujours affiché en plus.

## 5. Transitions

| Transition | Durée / easing | Avatar | Écran autour |
|---|---|---|---|
| Idle → Listening | 400ms, `--ease-presence` | Le rim s'éclaire, la respiration accélère, le regard devient net, 2 ondes entrent | Le greeting s'efface. La demande s'inscrit au-dessus de l'avatar. Les barres vocales apparaissent (500ms) |
| Listening → Thinking | 600ms | Le halo remonte (Y 36 → 22 %), le regard monte et balaie, les arcs s'allongent et accélèrent | Les barres vocales s'éteignent, libellé « Réflexion » |
| Thinking → Processing | 500ms | Les arcs sont remplacés par les repères, le regard s'éteint, le balayage commence | Les sources apparaissent (fade 400ms) puis s'allument une par une, +320ms chacune |
| Processing → Responding | 700ms | La teinte se réchauffe, le halo descend (Y → 44 %), la bouche s'active | Les sources se masquent. La réponse se révèle mot à mot, en suivant la voix |
| Responding → Success | 600ms, une fois | Flash du rim (1,6 s) et 3 ondes sortantes | SuccessPill en `rise` 500ms |
| Success → Idle | Maintien 2,8 s, puis 1,2 s | Retour à la respiration lente | La réponse reste lisible, les suggestions reviennent |
| Responding → Idle (sans action) | 1,2 s | Idem | Idem |
| Tout état → Listening (interruption) | 300ms | Coupe la voix, repart en écoute | La réponse partielle part dans le fil de l'échange |

Implémentation :
- Chaque propriété animée (α, Y, teinte, rim) est interpolée par CSS `transition` sur la durée ci-dessus.
- Les éléments qui apparaissent ou disparaissent (arcs, repères, ondes, bouche, balayage) passent par un fondu de 400ms, pas par un montage brutal.

## 6. Pilotage de `state` — **[À IMPLÉMENTER]**

Aujourd'hui, le prototype enchaîne les états avec des timers fixes. **[SIMULÉ]**

En production, un hook `useMimirConversation()` possède la machine d'état et expose `{ state, amplitude, request, response, sources, success }`.

```
            ┌──────────── push-to-talk relâché / envoi texte ───────────┐
            │                                                            ▼
 idle ── PTT enfoncé ──▶ listening ── fin STT (ou envoi texte) ──▶ thinking
  ▲                                                                   │
  │                              premier content_block tool_use ◀─────┤
  │                                        ▼                          │
  │                                   processing ── tool_result ──┐   │
  │                                        ▲                      │   │
  │                                        └── nouveau tool_use ──┘   │
  │                                                                   │
  │                          premier delta de texte (stream) ◀────────┘
  │                                        ▼
  │                                   responding ── fin TTS + message_stop
  │                                        │
  │           action avec résultat ?  oui ─┴─▶ success ── 2,8 s ──┐
  └────────────────────────── non ── 1,2 s ─────────────────────────┘
```

| Événement | Source | Transition |
|---|---|---|
| Push-to-talk enfoncé (Espace maintenu / bouton micro) | UI | `* → listening` |
| Envoi d'un message texte | UI | `idle → listening` (maintien 600ms minimum, pour que l'écoute soit perçue) `→ thinking` |
| Fin de la transcription STT | STT | `listening → thinking` |
| `content_block_start` de type `tool_use` | Stream Claude API | `thinking → processing` ; ajouter l'outil à `sources` |
| `tool_result` renvoyé, puis nouveau `tool_use` | Backend | reste en `processing` ; allume la source suivante |
| Premier `content_block_delta` de texte | Stream Claude API | `thinking/processing → responding` |
| Fin du TTS **et** `message_stop` | TTS + stream | `responding → success` si l'action a produit un résultat, sinon `→ idle` |
| Erreur (réseau, outil, quota) | Backend | `→ idle`, avec un toast d'erreur. Un état « error » dédié est **[OUVERT]** |

Règles :
- **Durée minimale par état : 400ms.** Si le backend répond plus vite, l'état est maintenu pour rester perceptible. Exception : `idle` peut être quitté instantanément.
- Les **sources** viennent des noms d'outils ou des documents réellement consultés, traduits en libellés lisibles (« Agenda », « Projets », « CV — version 4 »).
- En Responding, le texte est révélé **au rythme de la voix** : en v1, mots révélés à mesure que le TTS avance ; si le TTS fournit des timestamps, un alignement exact. Sans voix, le texte suit le stream de tokens.

## 7. Remplacer le placeholder par un avatar animé

1. Implémenter `MimirAvatar` avec la couche Frame qui rend `media` via un sous-composant `<AvatarMedia media state amplitude />`.
2. **v0 (maintenant)** : `media = { kind: 'placeholder' }`, la silhouette CSS.
3. **v0.5** : `{ kind: 'image', src }`, un render statique. Les couches Front et Outer continuent d'exprimer l'état.
4. **v1** : `{ kind: 'video', src }`, avec une boucle vidéo par état (idle, listening, thinking, processing, responding, success). Fondu enchaîné de 400ms entre les vidéos. La bouche de la couche Front reste active par-dessus.
5. **v2** : `{ kind: 'rig', driver }`, avec l'interface suivante.
   ```ts
   interface AvatarRigDriver {
     mount(el: HTMLElement): void;
     setState(state: MimirState, transitionMs: number): void;
     setAmplitude(level: number): void;      // 0–1
     setVisemes?(frames: VisemeFrame[]): void;
     setGaze?(target: { x: number; y: number }): void;
     dispose(): void;
   }
   ```
   Le driver reçoit exactement les mêmes événements que la présence. Si le rig gère son regard et sa bouche, masquer les traits de la couche Front (`opacity: 0`), garder le halo, les anneaux et les particules.

**Rien d'autre ne change** : ni l'écran Assistant, ni le layout, ni la machine d'état, ni l'API des autres composants.

Contraintes pour le média, quelle que soit sa nature :
- ratio 4:5 ;
- fond sombre (proche de `#080C10`) ;
- yeux à ~33 % et bouche à ~47 % de la hauteur ;
- épaules coupées par le bas du cadre ;
- aucun élément lumineux saturé, la lumière vient de la présence.

**[OUVERT]** : l'apparence définitive, la technologie (vidéo, WebGL/three.js, SDK d'avatar temps réel) et le fournisseur.

## 8. Tailles selon le contexte — **[EXACT]**

| Variante | Contexte | Dimension | Règle |
|---|---|---|---|
| `stage` | Écran Assistant desktop | Hauteur = espace libre de la scène, **min 150px** (120px si une demande est en cours et vh < 640), **max 480px**, ratio 4:5 | L'avatar est le seul élément flexible de la scène (`flex: 1 1 0`). Les autres éléments ont une hauteur fixe. Il ne rétrécit jamais sous son min |
| `stage` | Écran Assistant mobile | Même règle. ≈ 296px de haut sur 390×844 | La barre basse et le composer sont réservés d'abord |
| `hero` | Landing | Largeur `min(100%, 400px)` | Cycle automatique Idle → Listening → Thinking → Responding → Idle, 3,8 s par état. Arrêté si reduced-motion |
| `companion` | Onboarding | Largeur `min(100%, 290px)` | L'état suit l'étape : 1 idle, 2 listening, 3 thinking, 4 processing, 5 responding |
| `presence` | Workspace (bouton « Demander à Mímir »), barre mobile, InsightCard, toasts | 22–50px | Disque radial en `--light` (`radial-gradient(circle at 42% 38%, rgba(L,.6), rgba(L,.08) 70%)`) + bordure `rgba(L,.3)`. Respiration `mim-presence` de 5 s au repos, **1,6 s** quand Mímir n'est pas idle. Même état que l'avatar principal |

## 9. Accessibilité de l'avatar

- L'avatar a `aria-hidden="true"`. L'état est annoncé par le **libellé d'état** (texte visible), dans une région `aria-live="polite"`.
- La réponse est toujours écrite en entier, même quand elle est dite.
- En reduced-motion : `intensity` passe à 0.4 et toutes les boucles s'arrêtent. L'état reste lisible grâce à la position du halo, la teinte, le rim, les éléments statiques (repères, arcs figés) et le libellé.
