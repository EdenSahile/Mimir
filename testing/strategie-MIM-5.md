## Strategie de test -- MIM-5 (Initialiser le design system)

### 🟢 Tests automatises

| # | Critere | Ce qu'on verifie | Comment | Resultat |
|---|---------|-----------------|---------|----------|
| 1 | Tailwind CSS v4 installe et configure | Le composant AppBackground utilise des classes Tailwind (`fixed`, `inset-0`) et se rend correctement | Composant (AppBackground.test.tsx) | ✅ |
| 2 | Tokens CSS importes, toutes les variables disponibles | Les variables CSS sont declarees dans index.css et importees dans main.tsx. Les composants les consomment via `var(--token)` dans leurs styles inline | Config (index.css) | ✅ |
| 3 | 3 polices chargees depuis Google Fonts | L'import `@import url(...)` dans index.css charge Instrument Serif 400/italic, DM Sans 300/400/500, JetBrains Mono 400/500. Les tokens `--font-serif`, `--font-sans`, `--font-mono` sont declares | Config (index.css) | ✅ |
| 4 | AppBackground : fond fixe, 46 etoiles scintillantes, degrade, radiaux, grille | Position fixed, classe `inset-0`, 46 elements `[data-testid="star"]`, animation `scintillate` avec duree entre 6s et 12s, couches gradient et grid presentes dans le DOM | Composant (AppBackground.test.tsx) | ✅ |
| 5 | AppBackground rendu dans App.tsx | Le composant App rend un element `[data-testid="app-background"]` | Integration (App.test.tsx) | ✅ |
| 7 | `text-wrap: pretty` sur titres et paragraphes | La regle CSS `h1, h2, h3, h4, h5, h6, p { text-wrap: pretty }` est declaree dans index.css | Config (index.css) | ✅ |

### 🟠 Verification manuelle complementaire

| # | Critere | Couvert par les tests auto | A verifier visuellement | Resultat |
|---|---------|---------------------------|------------------------|----------|
| 4 | AppBackground : rendu visuel | Structure, nombre d'etoiles, animation declaree, couches presentes | Degrade void-2 → void-3 visible, radiaux d'ambiance perceptibles, grille 96px subtile au centre, etoiles qui scintillent lentement | ✅ Verifie via screenshot Playwright |

### 🔴 Smoke test manuel

| # | Critere | Quoi faire | Resultat attendu | Resultat |
|---|---------|-----------|-----------------|----------|
| 6 | Pas de flash blanc au chargement | Ouvrir http://localhost:5173 dans un nouvel onglet, hard refresh (Cmd+Shift+R) | Le fond sombre apparait immediatement, aucun eclair blanc | ✅ |

---

### Recap

**8 tests automatises** : 8/8 passent (2 fichiers, `AppBackground.test.tsx` + `App.test.tsx`).

**1 verification visuelle** : screenshot Playwright OK, degrade + grille + etoiles conformes a la maquette.

**1 smoke manuel** : flash blanc verifie OK par l'utilisateur.
