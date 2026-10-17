#!/usr/bin/env bash
# Applique les migrations Prisma en attente sur la base decrite par un fichier
# d'environnement.
#
# Usage :
#   pnpm db:deploy .env.test            # base de test
#   pnpm db:deploy .env                 # base de developpement local
#   pnpm db:deploy /chemin/vers/.env    # production, fichier fourni a la main
#
# La production n'applique PAS ses migrations pendant le build (voir DEC-012) :
# elle passe par cette commande, lancee deliberement, avant de promouvoir le
# deploiement.
#
# Le fichier d'environnement de production est fourni explicitement, et non
# recupere depuis Vercel : les variables du projet sont marquees sensibles, donc
# vercel env pull les rapporte VIDES (DATABASE_URL="") et vercel env run charge
# le .env local par-dessus. Les identifiants viennent donc de la console Neon.
# Ne pas le ranger dans le depot ni dans un chemin fixe : un dossier mktemp -d
# supprime apres usage.
set -euo pipefail

env_file_argument="${1:-}"
if [ -z "$env_file_argument" ]; then
  echo "Usage: pnpm db:deploy <chemin/vers/.env>" >&2
  exit 1
fi

if [ ! -f "$env_file_argument" ]; then
  echo "Fichier d'environnement introuvable : $env_file_argument" >&2
  exit 1
fi

env_file="$(cd "$(dirname "$env_file_argument")" && pwd)/$(basename "$env_file_argument")"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Le controle de la connexion directe n'est pas ici mais dans
# packages/db/cliDatasource, que prisma.config.ts traverse : il couvre aussi le
# migrate deploy lance par le buildCommand du service api en preview.
cd "$repo_root/packages/db"
# Le dotenv de packages/db attend la syntaxe -e fichier --
pnpm exec dotenv -e "$env_file" -- prisma migrate deploy
