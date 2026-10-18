#!/usr/bin/env bash
# Mesure en LECTURE SEULE l'etat d'une base : volume reel par table et
# historique des migrations. Aucune ecriture. La sortie ne contient ni
# identifiant ni donnee personnelle : elle est faite pour etre transmise.
#
# Usage :
#   DATABASE_URL="..." DIRECT_URL="..." pnpm db:audit
#   pnpm db:audit .env.test
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
    echo 'Usage: DATABASE_URL="..." DIRECT_URL="..." pnpm db:audit' >&2
    echo '   ou: pnpm db:audit .env.test' >&2
    exit 1
  fi
  cd "$repo_root/packages/db"
  exec pnpm exec tsx audit.ts
fi

if [ ! -f "$env_file_argument" ]; then
  echo "Fichier d'environnement introuvable : $env_file_argument" >&2
  exit 1
fi

env_file="$(cd "$(dirname "$env_file_argument")" && pwd)/$(basename "$env_file_argument")"

cd "$repo_root/packages/db"
# Le dotenv de packages/db attend la syntaxe -e fichier --
pnpm exec dotenv -e "$env_file" -- pnpm exec tsx audit.ts
