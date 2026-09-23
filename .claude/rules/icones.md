---
globs: ["apps/web/**"]
---

# Icones : toujours `lucide-react`

Toute icone affichee dans l'interface vient du paquet `lucide-react`, sans exception.

## Interdit

- Ecrire un `<svg>` a la main dans un composant, meme court.
- Utiliser un emoji ou un caractere pictographique comme icone.
- Ajouter une autre bibliotheque d'icones (`react-icons`, `heroicons`, `@tabler/icons`, Font Awesome...).
- Importer un fichier `.svg` comme composant ou comme image pour servir d'icone.

## A faire

Importer l'icone depuis `lucide-react` et la styler avec les classes Tailwind :

```tsx
import { CircleCheckIcon } from 'lucide-react'

<CircleCheckIcon className="size-4 text-emerald-600" />
```

Si l'icone voulue n'existe pas dans Lucide, ne pas la dessiner a la main : le dire et demander quoi faire.

## Perimetre logo

Cette rule vise les **icones** d'interface. Un logo ou une illustration n'est pas une icone : ces cas se discutent au moment ou ils se presentent.
