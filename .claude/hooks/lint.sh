#!/bin/sh
input=$(cat)

if printf '%s' "$input" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
	exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

if lint_output=$(pnpm lint 2>&1); then
	exit 0
fi

printf 'pnpm lint échoue. Corrige ces erreurs avant de terminer :\n%s\n' "$lint_output" >&2
exit 2
