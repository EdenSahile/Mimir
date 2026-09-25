# Branches et commits

## Nommage des branches

`<type>/MIM-<N>-<slug>`

- Le type suit les Conventional Commits : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.
- `MIM-<N>` est l'ID du ticket Notion correspondant.
- Le slug est un resume court en kebab-case.

Exemples : `feat/MIM-5-design-system`, `fix/MIM-12-auth-redirect`, `chore/MIM-8-ci-pipeline`.

## Messages de commit

Conventional Commits avec un scope qui nomme le domaine :

```
<type>(<scope>): <description>
```

- Le scope est le domaine fonctionnel en kebab-case : `design-system`, `auth`, `chat`, `onboarding`.
- La description est en anglais, en minuscules, sans point final.

Exemples :

```
feat(design-system): add button variants
feat(design-system): create color tokens
fix(auth): handle expired refresh token
chore(ci): add typecheck step to pipeline
```

## Pas de double systeme

Les IDs de tickets sont les `MIM-<N>` du backlog Notion. Ne pas introduire de numerotation parallele (F01, F02…).
