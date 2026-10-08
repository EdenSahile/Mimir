# Smoke tests -- MIM-23 (Mettre en place l'authentification)

> Ces scenarios sont ecrits **avant** l'implementation (test-first).
> Ils s'executent **apres**, stack lancee contre la vraie base Neon.
> Ils couvrent les criteres 🔴 et la part manuelle des criteres 🟠.

## Preconditions generales

- `.env` rempli (DATABASE_URL / DIRECT_URL Neon, secret Better Auth).
- Base migree (`pnpm db:migrate` d'un ticket precedent, tables de session Better Auth presentes).
- App lancee (`pnpm dev`), backend sur son port et frontend sur `http://localhost:5173`.
- Navigateur ouvert, outils de dev disponibles (onglets Network, Application/Cookies).

---

### Critere 1 -- Better Auth installe et configure

> **Ce qu'on verifie :** l'instance Better Auth est correctement cablee (adaptateur
> Prisma, emailAndPassword, handler monte sur `/api/auth/*`) et repond au runtime.
> Non auto : une assertion de config ne prouverait pas que la stack repond ; seul
> l'appel reel aux endpoints contre la vraie base le prouve.

**Preconditions**
- Backend lance, aucune session ouverte.

**Etapes**
1. Verifier que `better-auth` figure dans les dependances (`apps/api/package.json`).
2. Appeler l'endpoint de session sans etre connecte : `curl -i http://localhost:<port>/api/auth/get-session` (ou l'onglet Network sur un chargement de l'app).

**Resultat attendu**
- Le paquet est bien installe.
- L'endpoint `/api/auth/*` repond (pas de 404 de route inexistante) et renvoie une session nulle/vide sans erreur serveur. Le handler est donc monte et configure.

- [ ] Passe

---

### Critere 2 -- Inscription par email bout en bout (part manuelle du 🟠)

> **Ce qu'on verifie :** l'inscription reelle cree un compte en base et ouvre une
> session, sans verification d'email. La tranche auto (rendu du formulaire, champs,
> validation cliente, appel au client) est couverte par les tests composant ; ici
> on verifie uniquement l'effet bout en bout qui exige la vraie base.

**Preconditions**
- Aucun compte avec l'email de test en base.

**Etapes**
1. Aller sur l'ecran d'inscription (`/signup`).
2. Saisir un email neuf et un mot de passe valide.
3. Soumettre le formulaire.
4. Observer la redirection apres inscription (zone connectee).
5. Verifier en base (`pnpm db:studio` ou requete) la presence d'une ligne `User` pour cet email.

**Resultat attendu**
- Le compte est cree et actif immediatement (aucune etape de verification d'email).
- L'utilisateur est connecte dans la foulee (session ouverte).
- Une ligne `User` existe en base pour l'email saisi.

- [ ] Passe

---

### Critere 3 -- Connexion / deconnexion bout en bout (part manuelle du 🟠)

> **Ce qu'on verifie :** login avec un compte existant ouvre une session, logout la
> ferme, avec le cookie reel. La tranche auto (rendu des formulaires, appels
> `signIn`/`signOut` mockes) est couverte par les tests composant.

**Preconditions**
- Un compte existe (celui cree au scenario 2), aucune session ouverte.

**Etapes**
1. Aller sur l'ecran de connexion (`/login`).
2. Saisir l'email et le mot de passe du compte, soumettre.
3. Observer l'acces a la zone connectee.
4. Dans l'onglet Application/Cookies, verifier la presence du cookie de session.
5. Declencher la deconnexion (bouton/controle de logout).
6. Observer le retour a l'etat non connecte.

**Resultat attendu**
- Les bons identifiants ouvrent une session et donnent acces a la zone connectee.
- Le cookie de session est present apres login, absent/invalide apres logout.
- Apres deconnexion, l'acces a une page protegee renvoie vers `/login`.

- [ ] Passe

---

### Critere 4 -- Sessions persistees en base

> **Ce qu'on verifie :** une ligne de session est reellement ecrite dans la table
> geree par Better Auth lors du login, reliee au `User`, et la session survit a un
> rechargement de page. Purement dependant de la vraie base et du cycle de cookie,
> aucun test auto ne le couvre.

**Preconditions**
- Un compte existe, session fermee.

**Etapes**
1. Se connecter via `/login`.
2. Ouvrir `pnpm db:studio` (ou une requete) et inspecter la table de session Better Auth.
3. Recharger l'app dans le navigateur (F5).
4. Verifier que l'utilisateur est toujours connecte.
5. Appeler une route protegee (`/api/me`) avec le cookie de session.

**Resultat attendu**
- Une ligne de session existe en base, reliee a l'`id` du `User` connecte.
- Apres rechargement, la session est toujours active (pas de redirection vers login).
- `/api/me` renvoie les infos de l'utilisateur courant tant que la session est valide.

- [ ] Passe
