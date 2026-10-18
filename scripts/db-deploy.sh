#!/usr/bin/env bash
# Applique les migrations Prisma en attente.
#
# La production n'applique PAS ses migrations pendant le build (voir DEC-012) :
# elle passe par cette commande, lancee deliberement par l'utilisateur, avant
# de promouvoir le deploiement. Le controle de la connexion directe vit dans
# packages/db/cliDatasource, que prisma.config.ts traverse.
#
# Usage :
#   DATABASE_URL="..." DIRECT_URL="..." pnpm db:deploy
#   pnpm db:deploy .env.test
#
# La forme RECOMMANDEE pour la production est la premiere : les variables sont
# passees dans le shell, pour une seule commande, et ne touchent jamais le
# disque. Un fichier dans le repertoire personnel reste lisible par n'importe
# quel processus, dont un shell d'agent : la protection serait une norme, pas une
# construction.
set -euo pipefail

env_file_argument="${1:-}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "$env_file_argument" ]; then
  if [ -z "${DIRECT_URL:-}" ]; then
    echo "Ni fichier d'environnement en argument, ni DIRECT_URL dans l'environnement." >&2
    echo 'Usage: DATABASE_URL="..." DIRECT_URL="..." pnpm db:deploy' >&2
    echo '   ou: pnpm db:deploy .env.test' >&2
    exit 1
  fi
  cd "$repo_root/packages/db"
  exec pnpm exec prisma migrate deploy
fi

if [ ! -f "$env_file_argument" ]; then
  echo "Fichier d'environnement introuvable : $env_file_argument" >&2
  exit 1
fi

env_file="$(cd "$(dirname "$env_file_argument")" && pwd)/$(basename "$env_file_argument")"

cd "$repo_root/packages/db"
# Le dotenv de packages/db attend la syntaxe -e fichier --
pnpm exec dotenv -e "$env_file" -- pnpm exec prisma migrate deploy
