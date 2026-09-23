---
globs: ["apps/web/**"]
---

# UI & styling

Comment on construit l'interface dans ce projet.

## shadcn/ui des que shadcn fournit le composant

- **Le critere : shadcn a-t-il ce composant ?** Si oui (Button, Input, Card, Badge, Dialog, Form, toast, menu deroulant, popover...), on installe le composant shadcn, on ne le reecrit pas a la main.
- **Tailwind direct pour ce que shadcn ne fournit PAS** : mise en page, conteneurs, grilles, espacements, markup unique.
- Autrement dit : shadcn pour les **composants d'interface** (reutilisables, nommes), Tailwind direct pour la **structure** qui les dispose.

## Toujours restyler depuis la maquette

- Un composant shadcn sorti tel quel donne un rendu **generique**. Apres chaque `pnpm dlx shadcn add <composant>`, **restyler le fichier depuis les tokens de la maquette** (couleurs, arrondis, espacements) avant de l'utiliser.
- Le code du composant est copie dans `src/components/ui/` : il t'appartient, tu le modifies directement.

## S'assurer que shadcn est installe

- **Composant manquant** (shadcn deja initialise) : l'ajouter sans hesiter : `pnpm dlx shadcn add <composant>`.
- **shadcn pas encore initialise dans le repo** : l'initialiser, mais en suivant la **procedure d'installation courante pour Tailwind v4** (elle a change). Ne pas deviner la config, verifier la procedure a jour avant de lancer `init`.
