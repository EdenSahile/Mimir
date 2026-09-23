---
globs: ["apps/web/**"]
---

# Commentaires : frontend

Un commentaire ne se justifie que s'il apporte une information **que le code ne dit pas deja**. Par defaut, ne pas commenter.

## Ce qui merite un commentaire

- Le **pourquoi** non evident : une decision, un piege, une contrainte, un lien vers une regle metier.
- Un choix contre-intuitif qu'un lecteur voudrait « corriger » sans le contexte.

## Ce qui ne merite pas de commentaire

- **Paraphraser** un nom de variable, de fonction ou de prop.
- **Reecrire ce qu'une librairie documente deja.** Le nom d'un prop + sa description au survol (l'infobulle de l'IDE) suffisent.
- Decrire une ligne qui **se lit d'elle-meme**.

## Quand il est utile, il reste court

1 phrase, 1 ligne. Jamais une 2e ligne qui re-justifie ou detaille le mecanisme.

## Test avant d'ecrire un commentaire

« Est-ce que quelqu'un qui connait la stack comprend deja le code sans ce commentaire ? » Si oui, ne pas l'ecrire (ou le supprimer).
