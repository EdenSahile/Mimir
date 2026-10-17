#!/usr/bin/env bash
# Applique les migrations Prisma en attente sur une base.
#
# Usage :
#   scripts/db-deploy.sh production     # recupere les variables du projet Vercel
#   scripts/db-deploy.sh .env.test      # utilise un fichier d'environnement local
#
# La production n'applique PAS ses migrations pendant le build (voir DEC-012) :
# elle passe par cette commande, lancee deliberement, avant de promouvoir le
# deploiement.
set -euo pipefail

target="${1:-}"
if [ -z "$target" ]; then
  echo "Usage: scripts/db-deploy.sh <production|chemin/vers/.env>" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ "$target" = "production" ]; then
  # Les secrets de production ne touchent jamais un chemin fixe : dossier
  # temporaire supprime a la sortie, meme en cas d'erreur.
  env_dir="$(mktemp -d)"
  trap 'rm -rf "$env_dir"' EXIT
  env_file="$env_dir/.env"
  vercel env pull "$env_file" --environment=production --yes
else
  env_file="$(cd "$(dirname "$target")" && pwd)/$(basename "$target")"
  if [ ! -f "$env_file" ]; then
    echo "Fichier d'environnement introuvable : $env_file" >&2
    exit 1
  fi
fi

# Les migrations prennent des verrous consultatifs et des instructions de
# session, que PgBouncer en mode transaction supporte mal : elles doivent passer
# par la connexion directe de Neon, pas par l'URL poolee. prisma.config.ts
# cable directUrl sur DIRECT_URL, encore faut-il que la variable existe et
# qu'elle ne soit pas, elle aussi, poolee.
direct_url="$(grep -E '^DIRECT_URL=' "$env_file" | head -1 | cut -d= -f2- | tr -d '"')"
if [ -z "$direct_url" ]; then
  echo "DIRECT_URL absente de $env_file : la migration passerait par l'URL poolee" >&2
  exit 1
fi
case "$direct_url" in
  *-pooler.*)
    echo "DIRECT_URL pointe un host -pooler : ce doit etre la connexion directe" >&2
    exit 1
    ;;
esac

cd "$repo_root/packages/db"
# Le dotenv de packages/db est en version 8 : syntaxe -e fichier --
pnpm exec dotenv -e "$env_file" -- prisma migrate deploy
