# Gestionnaire de paquets : pnpm

Sur ce repo, le gestionnaire de paquets est **pnpm**, tout le temps, sans exception.

- Installer : `pnpm install` (jamais `npm install` ni `yarn`)
- Ajouter une dependance : `pnpm add <pkg>` (`pnpm add -D <pkg>` pour une dependance de dev)
- Supprimer : `pnpm remove <pkg>`
- Lancer un script : `pnpm <script>` (ex. `pnpm dev`, `pnpm build`, `pnpm typecheck`)
- Executer un binaire ponctuel : `pnpm dlx <pkg>` (jamais `npx`)

Ne jamais creer ni modifier `package-lock.json` ou `yarn.lock` : le seul lockfile est `pnpm-lock.yaml`.

Dans toute commande, doc ou exemple genere pour ce repo, ecrire `pnpm`, meme si la doc de l'outil montre `npm`.
