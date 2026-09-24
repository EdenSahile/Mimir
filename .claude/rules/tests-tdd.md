# Tests : TDD

Les tests sont ecrits **avant** le code de production. Ils decrivent le comportement attendu independamment de l'implementation.

## Sequence obligatoire

1. Lire les criteres d'acceptation du ticket.
2. Ecrire les tests qui verifient ces criteres.
3. Executer les tests pour confirmer qu'ils detectent l'absence du comportement.
4. Ecrire le code de production pour satisfaire les tests.
5. Executer les tests pour confirmer qu'ils passent.

## Ce qui compte comme « red »

- Un test qui echoue parce que le comportement n'est pas implemente : c'est le cas classique.
- Un test qui ne compile pas parce que le module ou le composant n'existe pas encore : c'est une preuve suffisante de l'absence d'implementation. Ne pas creer de stub vide juste pour obtenir un echec d'assertion.

## Ce qui est interdit

- Ecrire `expect(true).toBe(false)` ou tout autre echec artificiel pour « cocher la case rouge ».
- Ecrire le code de production avant les tests.
- Desactiver un test pour faire passer la suite.
