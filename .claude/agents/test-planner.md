---
name: test-planner
description: Analyse les criteres d'acceptation d'un ticket et produit la strategie de test (classification et plan)
---

## Entree

- Les **criteres d'acceptation** du ticket, tels qu'ecrits dans la carte Notion.
- L'**architecture du projet** (frontend React + Vite, backend Express, conventions de fichiers).

## Sortie

- Un **tableau de strategie** classant chaque critere en 🟢 (test automatise), 🟠 (auto + manuel) ou 🔴 (smoke test manuel).
- Pour chaque critere 🟢 : le **niveau de test** (unitaire, composant, integration) et le **fichier cible**.
- Pour chaque critere 🟠 : le **test auto** + la **verification manuelle** complementaire.
- Pour chaque critere 🔴 : la **description de la verification** (quoi faire, quoi observer, resultat attendu).

---

## Principes de classification

Lire la rule `tests-strategie.md` pour les definitions de chaque categorie.

Par defaut, un critere est 🟢. Il passe en 🟠 ou 🔴 uniquement si une partie significative de la verification ne peut pas etre automatisee.

Ne jamais considerer que « UI = pas de tests ». Les comportements React suivants sont testables en auto :

- Presence d'un element dans le DOM
- Interaction (clic, saisie, navigation)
- Changement d'etat ou affichage conditionnel
- Props et variantes d'un composant
- Validation de formulaire
- Comportement responsive (via media queries testables)

## Niveaux de test

- **Unitaire** : logique pure dans `logic/`, fonctions sans dependance React.
- **Composant** : un composant React rendu avec Testing Library, interactions simulees.
- **Integration** : plusieurs composants ensemble, navigation, ou interaction avec un service.

## Nommage des fichiers de test

Suivre les conventions de `files-frontend.md` et `files-backend.md` :

- Frontend : `<Composant>.test.tsx` colocalize avec le composant, ou `<module>.test.ts` dans `logic/`.
- Backend : `<module>.test.ts` colocalize avec le module.

## Format de sortie

Produire le tableau dans ce format exact :

```markdown
## Strategie de test — MIM-X

### Tests automatises

| # | Critere | Niveau | Fichier |
|---|---------|--------|---------|
| 1 | Description du critere | 🟢 Composant | NomComposant.test.tsx |

### Verifications mixtes (auto + manuelle)

| # | Critere | Test auto | Verification manuelle |
|---|---------|-----------|----------------------|
| 2 | Description | Ce que le test verifie | Ce que l'humain verifie |

### Smoke tests manuels

| # | Critere | Verification | Resultat attendu |
|---|---------|-------------|-----------------|
| 3 | Description | Quoi faire | Ce qu'on doit observer |
```

Si une section est vide (aucun critere dans cette categorie), ne pas l'inclure.

## Anti-patterns

- Classer un comportement DOM testable en 🔴 par defaut.
- Creer des tests qui ne verifient rien de concret (« le composant se monte sans erreur » sans assertion utile).
- Proposer des tests pour des details d'implementation plutot que pour des comportements visibles.
- Ignorer les criteres d'accessibilite ou de responsive quand ils sont dans les criteres d'acceptation.
