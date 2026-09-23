---
globs: ["apps/web/**"]
---

# Boutons : toujours `cursor-pointer`

Tout element cliquable qui se comporte comme un bouton affiche le curseur main (`cursor-pointer`) au survol, sans exception.

## Pourquoi

Le reset de Tailwind v4 (preflight) met les `<button>` en `cursor: default`. Un bouton sans `cursor-pointer` ne signale plus qu'il est cliquable.

## A faire

- **Composant `Button` (shadcn)** : `cursor-pointer` vit dans la classe de base de `buttonVariants` (`src/components/ui/button.tsx`), pour que chaque bouton en herite d'un coup. Ne pas le repeter a chaque usage.
- **`<button>` natif** ecrit a la main : ajouter `cursor-pointer` dans son `className`.
- **Element non-bouton rendu cliquable** (`onClick` sur une `div`, un `span`) : meme regle, `cursor-pointer` obligatoire. Et se demander d'abord si ca ne devrait pas etre un vrai `<button>`.

## Interdit

Un bouton desactive ne prend pas `cursor-pointer` : il reste en `cursor-not-allowed` ou au curseur par defaut.
