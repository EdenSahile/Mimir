#!/bin/sh
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

branch=$(git branch --show-current 2>/dev/null)

# Rappel uniquement sur une branche de travail (pas dev/main)
case "$branch" in
  dev|main|master|"") exit 0 ;;
esac

# Vérifier si un handoff a déjà été fait aujourd'hui
today=$(date +%Y-%m-%d)
if [ -d handoffs ] && ls handoffs/"${today}"-*-handoff.md >/dev/null 2>&1; then
  exit 0
fi

printf '💡 Pense à /handoff avant de changer de session.\n' >&2
exit 0
