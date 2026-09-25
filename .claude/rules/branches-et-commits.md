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

## Granularite des commits

Un commit = une preoccupation. Ne pas melanger dans le meme commit des changements qui relevent de sujets differents, meme s'ils ont ete faits dans la meme session de travail.

Decouper par type de changement :

- Le code de production du ticket (feature, fix) dans son commit.
- Les modifications de tooling (skills, agents, rules, CI) dans un commit separe.
- Les corrections de config (tsconfig, eslint) dans le commit du code qu'elles servent, sauf si elles sont independantes.
- La strategie de test dans le commit du code qu'elle couvre.

Le test : « si je reverte ce commit, est-ce que je reverte exactement un sujet, ou j'en casse plusieurs ? » Si plusieurs, decouper.

## Pas de double systeme

Les IDs de tickets sont les `MIM-<N>` du backlog Notion. Ne pas introduire de numerotation parallele (F01, F02…).
