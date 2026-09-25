## Strategie de test -- MIM-6 (Routing et structure de l'app)

| # | Critere | Type | Verification | Fichier |
|---|---------|------|--------------|---------|
| 1 | React Router installe et configure | Integration | 🟢 Auto | App.test.tsx |
| 2 | Toutes les routes definies dans App.tsx (providers + router) | Integration | 🟢 Auto | App.test.tsx |
| 3 | main.tsx ne contient que le montage dans le DOM | Integration | 🟢 Auto | App.test.tsx |
| 4 | Navigation entre routes fonctionnelle | Integration | 🟢 Auto | App.test.tsx |
| 5 | Pages placeholder pour chaque route | Integration | 🟢 Auto | App.test.tsx |
| 6 | Structure components/pages/ avec un dossier par ecran | Integration | 🟢 Auto | App.test.tsx |
| 7 | /settings redirige vers /settings/general | Integration | 🟢 Auto | App.test.tsx |
| 8 | URL inconnue affiche la page Not Found | Integration | 🟢 Auto | App.test.tsx |

---

### Detail des tests

- **#1** Verifier que App rend un router, que l'arbre de routes est monte.
- **#2** Pour chaque chemin (`/`, `/welcome`, `/mimir`, `/day`, `/projects`, `/projects/:id`, `/news`, `/jobs`, `/memory`, `/documents`, `/settings/:tab`), naviguer vers l'URL et verifier qu'un contenu s'affiche.
- **#3** Verifier que App.tsx porte les providers et le router (corollaire : main.tsx ne fait que monter App).
- **#4** Simuler un changement de route, verifier que le contenu affiche correspond a la route cible.
- **#5** Chaque route rend un composant qui affiche un element identifiable (nom de la page, titre, data-testid).
- **#6** Implicitement couvert par #2 et #5 : les composants de page sont importes depuis components/pages/.
- **#7** Naviguer vers `/settings` et verifier que la page Settings s'affiche (redirection vers `/settings/general`).
- **#8** Naviguer vers une URL inconnue et verifier que le heading "Not Found" s'affiche.
