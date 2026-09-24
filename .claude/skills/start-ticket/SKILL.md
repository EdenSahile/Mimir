---
name: start-ticket
description: Demarre un ticket Notion, passe en DOING, cree la branche et rappelle le livrable. Utiliser quand l'utilisateur dit "start ticket", "demarre le ticket", "on attaque MIM-X".
---

## Entree

- L'**identifiant du ticket** (ex. `MIM-5`, `5`, ou un lien Notion).

## Sortie

- Le ticket passe en **DOING** sur le board Notion.
- Une **branche dediee** creee depuis `dev`, checkout dessus.
- Le **livrable du ticket** (User Story + criteres d'acceptation) rappele a l'ecran.

---

## Base Notion

- **Data Source** : `collection://e26f4069-a2bd-4d19-9229-e3acb517b275`
- **Propriete ID ticket** : `userDefined:ID` (auto-increment numerique, ex. `5` pour MIM-5)
- **Propriete statut** : `Statut` → option cible `DOING`

## Pre-vol

- **Acces au board** : le skill lit et ecrit sur le board via le MCP Notion. S'il ne repond pas, stop et le dire.
- **Tree propre** : `git status --porcelain`. S'il reste des changements non commites, prevenir l'utilisateur et demander avant de continuer.

## Identifier le ticket

1. Prendre l'identifiant fourni par l'utilisateur.
2. Si c'est un lien Notion, l'ouvrir directement via fetch.
3. Si c'est un numero nu (ex. `5`), chercher le ticket dont `userDefined:ID` vaut ce numero.
4. Si c'est un identifiant prefixe (ex. `MIM-5`), extraire le numero et chercher.
5. Si rien n'est fourni, scanner la conversation pour un ticket recemment mentionne.
6. Si rien ne correspond ou si plusieurs matchent, demander. Ne jamais deviner.

## Workflow

### 1. Statut → DOING

- Charger les outils Notion via ToolSearch si besoin.
- Lire la propriete `Statut` du ticket.
- Si elle vaut deja `DOING`, ne rien faire, juste le signaler.
- Sinon, la passer a `DOING` via `update-page`.

### 2. Creer la branche

- S'assurer d'etre sur `dev` a jour :
  ```
  git checkout dev && git pull --ff-only
  ```
- Nommer la branche `feat/MIM-<numero>-<slug>` :
  - `<slug>` = kebab-case court derive du titre du ticket.
  ```
  git checkout -b feat/MIM-<numero>-<slug>
  ```
- Si la branche existe deja, checkout dessus et le signaler.

### 3. Rappeler le livrable

- Lire le **contenu de la page** du ticket (pas seulement ses proprietes).
- Restituer la **User Story** et les **criteres d'acceptation** pour cadrer le travail.

## Restitution

```
✅ MIM-5 → DOING · branche feat/MIM-5-design-system (depuis dev)

🎯 User Story : En tant qu'utilisateur, je veux que l'application ait l'apparence sombre...

📋 Criteres d'acceptation :
- [ ] Tailwind CSS v4 installe et configure
- [ ] Tokens CSS importes
- [ ] ...
```

## Anti-patterns

- Creer une branche sur un identifiant qui ne correspond a aucun ticket.
- Brancher par-dessus des changements non commites sans prevenir.
- Ecraser une branche existante du meme nom.
- Deviner le ticket quand plusieurs matchent.
- Oublier le rappel des criteres d'acceptation : c'est le point de depart du TDD.
