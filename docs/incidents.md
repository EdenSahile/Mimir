# Journal des incidents

Ce fichier consigne les pannes et les erreurs de methode du chantier, avec ce qui a ete mesure et ce qui a ete suppose. Il n'enonce aucune regle : les regles qui en sont tirees vivent dans `.claude/rules/`, et chaque entree pointe vers la sienne.

Il existe parce qu'une rule n'est pas un journal. Accumuler les cas dans une rule la fait grossir sans la rendre plus contraignante, et la regle finit noyee sous ses exemples.

## Verifications portant sur un indicateur correle, pas sur la chose

Regle tiree de ces cas : `.claude/rules/deploiement-production.md`, section « Une verification porte sur la chose elle-meme ».

**5 occurrences en 11 jours, du 2026-10-18 au 2026-10-29.**

| Date | Ce qui a ete mesure | Ce qu'il fallait mesurer |
| --- | --- | --- |
| 2026-10-18 | Les logs de **build**, pour conclure « rien n'a change » sur une panne d'**empaquetage** de la fonction. Ils sont identiques avec et sans les 3 champs de build. | Le paquet de fonction. |
| 2026-10-18 | Le **handler** du paquet, pour valider un correctif `.mjs`. Un handler correct ne dit rien des modules presents a cote, et il manquait `cors`. | Le contenu du paquet. |
| 2026-10-19 | Que le **dernier** deploiement de production etait posterieur aux ecritures de variables, pour conclure que la rotation du mot de passe etait appliquee. | Le deploiement **qui porte l'alias**, qui etait un autre objet. |
| 2026-10-26 au 29 | Rien : `autoAssignCustomDomains: false` a ete **repris** d'une session anterieure et presente comme mesure 3 jours de suite. | Le reglage, par une requete. |
| 2026-10-29 | Un `401` sur l'URL technique du deploiement candidat, pris pour le refus de l'application. Il venait de la **Deployment Protection** de Vercel, avant Express. | Le **corps** de la reponse, seul a distinguer les 2 cas. |

## Panne d'authentification en production, 2026-10-19 au 2026-10-29

`/api/health` repondait `200` et `POST /api/auth/sign-in/email` repondait `500`. **15 deploiements de production `READY` pendant ce temps, et aucune alerte.**

### Les durees, qui sont 2 et pas une

Les confondre a produit 2 chiffres contradictoires dans les comptes rendus. Jeu de chiffres de reference :

| Fait | Debut | Fin | Duree | Source |
| --- | --- | --- | --- | --- |
| Le domaine sert un deploiement perime | 2026-10-18 12:43:07 CEST | 2026-10-29 ~20:47 CET | **11 jours** | `vercel inspect` |
| L'authentification repond `500` | 2026-10-19, rotation des identifiants | 2026-10-29 ~20:47 CET | **10 jours** | `vercel env ls`, log `P1000` du 2026-10-19 |

Le domaine etait deja epingle **avant** que la panne commence : le deploiement du 18 fonctionnait, puisqu'il portait alors le mot de passe valide. C'est la rotation du 19 qui l'a rendu non fonctionnel. L'epinglage est la cause dormante, la rotation est le declencheur.

- **Cause**, etablie par le log d'execution : mot de passe de base perime, fige dans le deploiement servi. `P1000`, `Authentication failed against the database server`, `DriverAdapterError: AuthenticationFailed` levee par `PrismaNeonAdapter`.
- **Mecanisme** : les variables d'environnement sont figees dans le deploiement a sa creation. La rotation du 2026-10-19 a remplace `DATABASE_URL` et `DIRECT_URL` cote Vercel, mais `mimir-navy.vercel.app` servait un deploiement du 2026-10-18, qui portait l'ancienne valeur.
- **Resolution** : `vercel promote` du deploiement `dpl_4eXLZMjMzRNcbGmGrgrGLDAMByCz`. Les 2 controles de sortie sont passes dans la minute, `200` et `401`.
- **Non explique** : pourquoi le domaine n'a pas suivi les 15 deploiements. Voir le protocole de resolution dans `.claude/rules/deploiement-production.md`.
- **Ce que la panne a revele** : aucun controle automatise ne tape la production apres un deploiement. La detection reposait entierement sur un `curl` lance a la main. C'est l'objet d'un ticket a part.
