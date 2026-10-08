## Strategie de test -- MIM-23 (Mettre en place l'authentification)

Ce ticket cable pour la premiere fois la vraie structure backend en couches et
branche Better Auth (adaptateur Prisma sur `@mimir/db`, handler monte sur
`/api/auth/*`). Le tri se fait critere par critere avec la question : qu'est-ce
que je verifie exactement ? La logique a nous (middleware `requireAuth`, routes
publiques, garde frontend, rendu des ecrans de connexion (`/login`) et
d'inscription (`/signup`), 2 routes separees, client auth) est testable en auto. Ce qui exige la stack reelle, la vraie base et le cycle de
cookie (inscription creant un compte, login/logout bout en bout, persistance de
la session en base, configuration effective de Better Auth) se verifie a la main.

Un critere d'integration route est ajoute (rule `tests-strategie.md`) : l'ecran
de login est un composant de page rendu par une route dans `App.tsx`.

| Critere | Type | Fait |
|---|---|---|
| Better Auth installe et configure | 🔴 | ⬜ Smoke |
| Inscription par email fonctionnelle | 🟠 | ⬜ Auto · ⬜ Smoke |
| Connexion / deconnexion fonctionnelle | 🟠 | ⬜ Auto · ⬜ Smoke |
| Sessions persistees en base | 🔴 | ⬜ Smoke |
| Middleware d'auth sur les routes protegees | 🟢 | ⬜ |
| Routes publiques accessibles sans auth (`/health`, landing, login) | 🟢 | ⬜ |
| Client auth cote frontend (Better Auth React) | 🟢 | ⬜ |
| Redirection vers login si non authentifie | 🟢 | ⬜ |
| [ROUTE] L'ecran de connexion est rendu sur sa route (`/login`) | 🟢 | ⬜ |
| [ROUTE] L'ecran d'inscription est rendu sur sa route (`/signup`) | 🟢 | ⬜ |

### Raisonnement par critere

**Better Auth installe et configure** -- 🔴
Ce qu'on verifie, c'est que le paquet est installe et que l'instance Better Auth
est correctement configuree (adaptateur Prisma sur `@mimir/db`,
`emailAndPassword` active, handler monte sur `/api/auth/*`). Un test auto ne
ferait que re-asserter des valeurs de config. La seule verification qui a du sens
est au runtime : les endpoints `/api/auth/*` repondent contre la vraie base.
C'est operationnel, comme les criteres d'infra de MIM-22. Smoke.

**Inscription par email fonctionnelle** -- 🟠
Deux tranches distinctes.
Auto : l'ecran d'inscription rend ses champs (email, mot de passe) avec leurs
roles/labels accessibles et son bouton de soumission ; la validation cliente
bloque un formulaire incomplet ; la soumission appelle le client auth (mocke).
Testable au niveau composant sans navigateur ni base.
Manuel : l'inscription reelle cree un compte en base et ouvre une session, sans
etape de verification d'email (compte actif immediatement). Exige la stack reelle
et la vraie base. Smoke.

**Connexion / deconnexion fonctionnelle** -- 🟠
Deux tranches distinctes.
Auto : l'ecran de connexion rend ses champs (email, mot de passe) avec roles et
bouton ; la soumission appelle `signIn` du client (mocke) ; le controle de
deconnexion est present et declenche `signOut` au clic. Niveau composant.
Manuel : la connexion avec un compte existant ouvre une session, la deconnexion
la ferme, bout en bout avec le cookie reel. Exige la stack reelle. Smoke.

**Sessions persistees en base** -- 🔴
Ce qu'on verifie, c'est qu'une ligne de session est reellement ecrite dans la
table geree par Better Auth lors du login, reliee au `User`, et qu'elle survit
au rechargement. Purement dependant de la vraie base et du cycle de cookie.
Aucun test auto ne couvre ca. Smoke.

**Middleware d'auth sur les routes protegees** -- 🟢
La logique du middleware `requireAuth` est a nous et deterministe : session
presente -> `next()` est appele et la requete poursuit ; session absente ->
reponse 401 et `next()` non appele. On teste avec un `req`/`res`/`next` simules
(et la lecture de session mockee), sans serveur ni base. On verifie aussi qu'une
route protegee d'exemple (`/api/me`) passe par le middleware. Entierement couvert.

**Routes publiques accessibles sans auth (`/health`, landing, login)** -- 🟢
Cote backend : un appel (supertest sur l'app Express) a `/health` renvoie 200
sans authentification et ne passe pas par `requireAuth` (pas de base requise pour
`/health`). Cote frontend : la garde laisse passer les routes publiques (landing,
login) sans session, sans rediriger. Accessibilite verifiable en auto, au niveau
app/composant.

**Client auth cote frontend (Better Auth React)** -- 🟢
Ce qu'on verifie, c'est que le module client (`createAuthClient` de
`better-auth/react`) est configure et expose les fonctions attendues
(`useSession`, `signIn`, `signUp`, `signOut`) avec la bonne `baseURL`. C'est du
code a nous dont on teste la forme du module (presence et type des exports).
Le fonctionnement bout en bout contre le backend reel est couvert par les smokes
des criteres 2 et 3. La config du client, elle, est auto.

**Redirection vers login si non authentifie** -- 🟢
La garde frontend est un composant a nous. Avec `useSession` mocke renvoyant
"pas de session", on monte la garde autour d'un contenu protege et on assert
qu'elle rend une redirection vers `/login` (Navigate) et que le contenu protege
n'est pas rendu ; avec une session presente, le contenu est rendu. Affichage
conditionnel pur, testable au niveau composant.

**[ROUTE] Les ecrans de connexion et d'inscription sont rendus sur leurs routes** -- 🟢
Criteres d'integration route imposes par la rule : il y a 2 composants de page
(connexion et inscription), donc 2 routes separees et 2 tests de route. Dans
`App.test.tsx`, on navigue vers `/login` et on assert qu'un element de l'ecran de
connexion (ex. le champ email ou le titre) est present dans le DOM ; puis on
navigue vers `/signup` et on assert de meme pour l'ecran d'inscription. Chaque
test verifie le branchement reel de son composant dans l'arbre de routes,
independamment des tests unitaires du composant.

## A verifier manuellement

4 scenarios dans [`testing/smokes-MIM-23.md`](smokes-MIM-23.md) : les 2 criteres
🔴 (configuration effective de Better Auth, persistance de session en base) et la
part manuelle des 2 criteres 🟠 (inscription bout en bout, connexion/deconnexion
bout en bout). Joues en local pendant le dev contre la vraie base Neon.
