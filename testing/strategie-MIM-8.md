## Strategie de test -- MIM-8 (Construire la navigation)

| Critere | Type | Fait |
|---|---|---|
| NavRail visible >= 760px, masque en dessous | 🟠 | ✅ Auto · ⬜ Smoke |
| NavRail : element actif avec `aria-current="page"`, trait lumineux 1x13px | 🟠 | ✅ Auto · ⬜ Smoke |
| BottomBar visible < 760px avec MimirPresence au centre (50px, respiration) | 🟠 | ✅ Auto · ⬜ Smoke |
| MoreSheet : s'ouvre au tap sur "Plus", fond scrim, fermeture au tap exterieur | 🟢 | ✅ |
| ModeSwitch : bascule Assistant/Workspace | 🟢 | ✅ |
| AppHeader : initiales dans cercle 30px, horloge mono >= 1100px | 🟠 | ✅ Auto · ⬜ Smoke |
| Transition Assistant <-> Workspace : 900ms, `--ease-presence` | 🟠 | ✅ Auto · ⬜ Smoke |
| Wordmark cliquable, retour a l'accueil | 🟢 | ✅ |
| Navigation au clavier : Tab parcourt rail, en-tete, contenu, composer | 🟢 | ✅ |

## A verifier manuellement

5 scenarios dans [`testing/smokes-MIM-8.md`](smokes-MIM-8.md).
