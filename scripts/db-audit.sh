#!/usr/bin/env bash
# Mesure en LECTURE SEULE l'etat de la base decrite par un fichier
# d'environnement : volume reel par table et historique des migrations.
#
# Usage :
#   pnpm db:audit .env.test
#   pnpm db:audit /chemin/vers/.env     # production, fichier fourni a la main
#
# Aucune ecriture, aucune migration. La sortie ne contient ni identifiant ni
# donnee personnelle : elle est faite pour etre transmise telle quelle.
set -euo pipefail

env_file_argument="${1:-}"
if [ -z "$env_file_argument" ]; then
  echo "Usage: pnpm db:audit <chemin/vers/.env>" >&2
  exit 1
fi

if [ ! -f "$env_file_argument" ]; then
  echo "Fichier d'environnement introuvable : $env_file_argument" >&2
  exit 1
fi

env_file="$(cd "$(dirname "$env_file_argument")" && pwd)/$(basename "$env_file_argument")"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$repo_root/packages/db"
pnpm exec dotenv -e "$env_file" -- tsx audit.ts
