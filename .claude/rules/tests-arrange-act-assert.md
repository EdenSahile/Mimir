# Tests : Arrange, Act, Assert strict

Chaque test suit les 3 phases **Arrange, Act, Assert**, separees visuellement par une ligne vide, y compris quand le test tiendrait sur une ligne.

- **Arrange** : preparer les donnees d'entree.
- **Act** : appeler la fonction testee. Selon le cas, dans une variable dediee ou directement dans le `expect` (voir ci-dessous).
- **Assert** : verifier le resultat avec `expect(...)`.

## Inliner l'appel dans le `expect` : ca depend de ce qu'on assert

**Assertion sur la sortie de la fonction : on peut inliner.** Pour une fonction pure dont on teste la valeur de retour, `expect(fn(args)).toEqual(attendu)` est idiomatique et lisible.

**Assertion sur l'entree (test de non-mutation) : l'appel reste une ligne a part.** On ne verifie pas ce que la fonction renvoie, mais que l'entree est inchangee apres l'appel. Imbriquer l'appel dans le `expect` change le sens du test.

- ✗ `expect(editProduct(menu, edited)).toEqual(originalMenu)`
- ✓
  ```ts
  editProduct(menu, edited)

  expect(menu).toEqual(originalMenu)
  ```

## Nommer les variables par leur contenu, pas par leur role

Interdit d'utiliser `result` ou `expected` **seuls**. Nommer d'apres le contenu reel.

- ✗ `const result = deleteProduct(menu, id)`
- ✓ `const menuAfterDeletion = deleteProduct(menu, id)`

### Exception : l'operande attendu quand il partage le contenu du calcul

`expected` + contenu est la bonne facon de marquer la reference quand le contenu seul serait ambigu :

- ✗ `expect(menuAfterDeletion).toEqual(menuAfterDeletion)`
- ✓ `expect(menuAfterDeletion).toEqual(expectedMenuAfterDeletion)`
