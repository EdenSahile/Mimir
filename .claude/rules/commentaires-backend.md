---
globs: ["apps/api/**"]
---

# Commentaires : backend

Un commentaire ne se justifie que s'il apporte une information **que le code ne dit pas deja**. Par defaut, ne pas commenter.

## Ce qui merite un commentaire

- Le **pourquoi** non evident : une decision, un piege, une contrainte, un lien vers une regle metier.
- Un choix contre-intuitif qu'un lecteur voudrait « corriger » sans le contexte.
- Un **comportement de dependance releve a la source**, que sa documentation ne dit pas. Ex. « verifie dans better-auth 1.7.2 : le code est `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`, et non `USER_ALREADY_EXISTS` ». Ces trouvailles n'existent nulle part ailleurs.

## Ce qui ne merite pas de commentaire

- **Paraphraser** un nom de variable, de fonction ou de type.
- **Reecrire ce qu'une librairie documente deja.**
- Decrire une ligne qui **se lit d'elle-meme**.

## Quand il est utile, il reste aussi court que son contenu l'exige

Un commentaire qui explique un **pourquoi** tient en 1 phrase.

**L'exception** : un commentaire qui porte un comportement releve a la source d'une dependance a le droit de decrire le mecanisme, sur plusieurs lignes s'il le faut. C'est le seul cas ou la longueur se justifie, parce que le lecteur n'a aucun autre moyen de retrouver l'information.

## Test avant d'ecrire un commentaire

« Est-ce que quelqu'un qui connait la stack comprend deja le code sans ce commentaire ? » Si oui, ne pas l'ecrire (ou le supprimer).
