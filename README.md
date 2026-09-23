# Mímir

Assistant personnel IA accessible via une application web.

## Démarrage rapide

```bash
pnpm install
cp .env.example .env    # Configurer les variables d'environnement
pnpm db:generate        # Générer le client Prisma
pnpm dev                # Lancer le projet
```

## Structure

| Dossier | Contenu |
|---------|---------|
| `apps/web/` | Frontend React + Vite + TypeScript |
| `apps/api/` | Backend Node.js + Express + TypeScript |
| `packages/db/` | Schéma Prisma et client base de données |
| `packages/shared/` | Types et interfaces partagés |
| `docs/` | Documentation produit et technique |

## Documentation

Voir le dossier `docs/` pour la documentation complète.
