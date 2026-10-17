# PRD — Mímir

**Document de référence produit**  
**Version :** 1.0 · **Date :** 10 octobre 2026 · **Statut :** proposition consolidée  
**Périmètre :** produit web Mímir, de l'inscription à l'assistance quotidienne.

> Ce document décrit le problème, les utilisateurs, les comportements attendus et les critères de réussite. Il ne remplace pas les spécifications techniques ni la charte graphique. Les décisions non encore prises sont indiquées comme ouvertes plutôt que présentées comme acquises.

## 1. Résumé

Mímir est un assistant personnel IA qui s'appuie sur le contexte propre à chaque utilisateur : son profil, ses objectifs, ses projets, ses documents, sa mémoire et, lorsqu'il les connecte, ses outils externes. L'utilisateur échange avec Mímir dans une interface incarnée par un avatar. Un espace de travail permet aussi de consulter et gérer les informations structurées.

La promesse est simple : **l'utilisateur explique ce qu'il cherche à accomplir une fois ; Mímir s'en souvient, retrouve le contexte pertinent et l'aide à avancer sans lui faire répéter toute son histoire.**

Mímir doit rester générique. Aucun métier, profil ou jeu de données de démonstration ne doit être codé en dur comme s'il s'agissait de l'utilisateur réel.

## 2. Problème et opportunité

Les informations personnelles utiles au travail et à l'organisation sont dispersées entre conversations, fichiers, projets, calendriers et services. Les assistants généralistes demandent souvent de répéter le contexte ; les tableaux de bord, eux, présentent des données sans toujours aider à décider quoi faire.

Mímir réunit ces deux besoins : comprendre un contexte personnel durable et le transformer en aide concrète, tout en laissant à la personne la maîtrise de ses données et de ce que l'assistant retient.

## 3. Utilisateurs visés

### Public principal

Toute personne qui gère plusieurs objectifs, projets ou sources d'information et souhaite une aide personnalisée : salarié, indépendant, entrepreneur, étudiant ou personne en transition professionnelle.

### Besoins représentatifs

- **Professionnel ou indépendant :** préparer un rendez-vous, suivre des projets, retrouver une décision ou rédiger à partir de ses documents.
- **Personne en recherche d'emploi :** organiser ses critères, comparer des offres, suivre ses candidatures et adapter son CV.
- **Étudiant :** organiser ses cours, retrouver des notions dans ses documents et préparer ses échéances.
- **Utilisateur prudent vis-à-vis de l'IA :** comprendre ce qui est mémorisé, corriger ou supprimer une information, contrôler les connexions et les permissions.

Ces exemples guident les scénarios ; ils ne limitent pas le produit à ces profils.

## 4. Objectifs et hors objectifs

### Objectifs

1. Permettre à un nouvel utilisateur de donner un contexte utile sans configuration laborieuse.
2. Répondre en tenant compte des données pertinentes de cet utilisateur et rendre les sources de contexte compréhensibles.
3. Aider à organiser et faire avancer objectifs, projets et tâches depuis une conversation ou l'espace de travail.
4. Donner à l'utilisateur une visibilité et un contrôle réels sur sa mémoire, ses documents et ses intégrations.
5. Faire de l'avatar et de la conversation la présence centrale du produit, sans sacrifier la lisibilité ni l'accessibilité.

### Hors objectifs du MVP

- Remplacer un outil complet de gestion de projet, un calendrier ou un système de recrutement.
- Agir de manière irréversible au nom de l'utilisateur sans confirmation.
- Fournir un assistant vocal mains libres ou un mot d'éveil en continu.
- Garantir l'exactitude de toute information produite par un modèle IA.
- Imposer un profil métier particulier ou une intégration tierce.

## 5. Principes produit

- **Contexte avant volume :** montrer peu d'informations, choisies parce qu'elles sont utiles.
- **Une présence, deux espaces :** Assistant et Workspace partagent le même état de conversation et les mêmes données.
- **Mémoire sous contrôle :** rendre la source d'un souvenir visible et permettre de le corriger ou de l'oublier.
- **Transparence :** signaler quand Mímir consulte des documents ou outils ; distinguer faits, suggestions et incertitudes.
- **Confirmation avant effet externe :** toute action qui envoie, publie, supprime ou modifie des données externes nécessite une validation explicite.
- **Progressivité :** le produit reste utile avant l'ajout de la voix, des intégrations et de l'avatar final.

## 6. Parcours principaux

### 6.1 Découverte et création de compte

1. La landing page présente la promesse de Mímir et donne accès à l'inscription ou à la connexion.
2. L'utilisateur crée un compte avec son adresse e-mail et un mot de passe.
3. Une confirmation claire signale toute erreur de saisie, d'authentification ou de réseau.
4. Après connexion, l'utilisateur reprend son parcours ou arrive dans l'Assistant.

**Résultat attendu :** un compte personnel est créé ; les données d'un autre compte ne sont jamais visibles.

### 6.2 Onboarding et profil

1. Mímir demande le prénom, l'activité, les objectifs, les intérêts et le degré d'initiative souhaité.
2. L'utilisateur peut passer une question et revenir compléter son profil plus tard.
3. Les réponses sont sauvegardées et présentées comme des éléments de profil/mémoire provenant de l'onboarding.
4. L'utilisateur peut modifier les réponses depuis les réglages et quitter l'onboarding sans perdre les étapes déjà validées.
5. À la fin, l'Assistant explique brièvement qu'il est prêt, sans prétendre connaître des informations non fournies.

**Critères :** progression visible ; reprise après actualisation ; validation des champs ; possibilité de passer les questions facultatives ; aucune donnée de démonstration attribuée au compte.

### 6.3 Poser une question et recevoir de l'aide

1. L'utilisateur écrit une demande dans le composer et l'envoie par Entrée ou par le bouton d'envoi.
2. Mímir indique les étapes utiles de son travail : écoute/réception, réflexion, consultation de données, réponse.
3. La réponse apparaît en texte lisible et reste consultable dans le fil de conversation.
4. Lorsque cela aide à évaluer la réponse, Mímir indique les sources consultées (profil, mémoire, document ou intégration).
5. Une action réussie peut proposer un lien vers l'élément créé ou consulté.
6. L'utilisateur peut poursuivre le même fil, démarrer un nouveau fil ou naviguer dans le Workspace sans interrompre une demande en cours.

**Critères :** un envoi vide ne déclenche rien ; erreurs et délais sont annoncés avec une possibilité de réessayer ; la réponse complète reste accessible même si l'animation est désactivée ; Mímir ne fabrique pas de source.

### 6.4 Consulter sa journée et ses projets

- **My Day :** synthèse des priorités, événements pertinents et rappels disponibles. Ce n'est pas un calendrier exhaustif.
- **Projets :** liste, statut, objectifs, tâches, documents et services liés ; accès à une fiche projet.
- **Tâches :** création, mise à jour de statut, priorité et échéance ; association facultative à un projet.
- **Actions depuis un module :** « Demander à Mímir » ouvre l'Assistant avec le contexte du module conservé.

**Critères :** listes vides et erreurs disposent d'un état compréhensible ; toute modification est persistée et confirmée ; les données restent isolées par utilisateur.

### 6.5 Documents

1. L'utilisateur ajoute un document personnel ou le rattache à un projet.
2. Mímir indique clairement les formats pris en charge, les limites de taille et l'état de traitement.
3. Après extraction et indexation, l'utilisateur peut demander une analyse ou poser une question sur le contenu.
4. Le résultat permet de retrouver le document source ; l'utilisateur peut le supprimer et déclencher aussi la suppression de son contenu indexé.

**Critères :** types invalides, échecs d'extraction et traitement en cours sont différenciés ; le fichier n'est pas présenté comme indexé avant la fin du traitement ; les documents d'un autre compte ne sont jamais accessibles.

### 6.6 Mémoire et confidentialité

- La vue Mémoire regroupe les éléments retenus par catégorie et affiche leur origine et leur date.
- L'utilisateur peut modifier, confirmer, supprimer un souvenir ou tout effacer après confirmation.
- L'onboarding et les conversations doivent être distingués comme sources.
- La suppression d'une donnée doit être propagée aux index et données dérivées pertinents.
- Les réglages expliquent les données conservées, les usages de l'IA et les permissions accordées aux services connectés.

**Critères :** une suppression est confirmée et ne réapparaît pas dans les réponses futures ; les contrôles de mémoire sont accessibles au clavier ; aucun secret OAuth n'est affiché en clair.

### 6.7 Intégrations et modules

- Les modules peuvent être activés, désactivés et configurés par utilisateur.
- Une intégration n'est active qu'après autorisation explicite ; les permissions demandées sont affichées avant la connexion.
- L'utilisateur peut consulter, révoquer ou renouveler une connexion.
- Une erreur ou une autorisation expirée est signalée ; les données récupérées restent identifiées par leur source.
- Les premières intégrations envisagées sont Google Calendar, Gmail, GitHub et Notion ; le fournisseur et le périmètre exact restent à confirmer pour chaque connexion.

## 7. Exigences fonctionnelles

Priorités : **P0** = nécessaire au MVP ; **P1** = prochaine étape produit ; **P2** = évolution après validation.

| ID | Priorité | Exigence | Critère d'acceptation principal |
|---|---|---|---|
| F-01 | P0 | Inscription, connexion, déconnexion et persistance de session | Les routes privées redirigent vers la connexion sans session. |
| F-02 | P0 | Onboarding multi-étapes sauvegardé | Les réponses sont propres au compte, modifiables et reprenables. |
| F-03 | P0 | Profil et préférences utilisateur | Les modifications persistent et influencent les réponses futures. |
| F-04 | P0 | Conversation textuelle avec streaming | Le fil est persisté ; l'utilisateur voit les états, erreurs et réponse complète. |
| F-05 | P0 | Orchestration avec contexte du profil | Seules les informations autorisées et pertinentes sont transmises au modèle. |
| F-06 | P0 | Mémoire inspectable et contrôlable | Source visible ; modification et suppression disponibles. |
| F-07 | P0 | Gestion minimale des projets et tâches | Création, lecture, mise à jour et suppression selon les règles de confirmation. |
| F-08 | P0 | Assistant et Workspace reliés | Navigation sans perte du fil ni interruption silencieuse d'une demande. |
| F-09 | P0 | États vides, chargement, succès et erreur | Chaque vue principale informe l'utilisateur de son état et de l'action suivante. |
| F-10 | P1 | Dépôt, extraction et recherche dans les documents | États de traitement distincts et suppression des données dérivées. |
| F-11 | P1 | My Day à partir de tâches et agenda connecté | La synthèse identifie les données réellement disponibles et leur date. |
| F-12 | P1 | Modules AI News et Job Watch | Activation configurable ; pertinence expliquée ; données et candidatures gérables. |
| F-13 | P1 | Première intégration OAuth | Permissions visibles, tokens protégés, déconnexion effective. |
| F-14 | P2 | Entrée vocale et réponse parlée | Permission micro explicite, transcription et texte toujours disponibles. |
| F-15 | P2 | Avatar média animé final | Le média peut être remplacé sans modifier la logique des écrans ni l'accessibilité. |
| F-16 | P2 | Mode mains libres / veille | À décider après validation de l'usage et des implications de confidentialité. |

**Précision de statut :** le dépôt contient des écrans et interactions de prototype, mais plusieurs fonctions sont simulées. Un écran maquetté ne signifie pas que son exigence est livrée. La roadmap et les tickets doivent établir l'état d'implémentation réel.

## 8. Exigences non fonctionnelles

### Sécurité et vie privée

- Toutes les lectures et écritures de données métier sont filtrées par l'utilisateur authentifié.
- Les tokens d'intégration sont chiffrés au repos en production et jamais journalisés.
- Les permissions des intégrations suivent le principe du moindre privilège.
- Les données personnelles envoyées au fournisseur IA sont limitées au contexte nécessaire ; le produit doit documenter le fournisseur et le traitement.
- Les actions destructives et les actions externes sont confirmées.
- Les règles de conservation, export et suppression doivent être définies avant une ouverture publique.

### Accessibilité et compatibilité

- Parcours utilisables au clavier ; focus visible ; zones tactiles d'au moins 44px sur mobile.
- Les changements d'état importants sont annoncés aux lecteurs d'écran.
- Le texte est toujours disponible quand une réponse est parlée ; la couleur n'est jamais le seul indicateur.
- Respect de `prefers-reduced-motion` et du réglage de mouvement réduit.
- Responsive mobile, tablette et ordinateur ; le composer de l'Assistant reste accessible sans chevaucher le contenu.

### Fiabilité et performance

- Les erreurs réseau, du modèle, du stockage ou des intégrations sont récupérables autant que possible.
- Les opérations longues affichent un état et ne sont pas présentées comme terminées avant confirmation du serveur.
- Le streaming doit rester dans les limites de l'hébergement retenu ; l'indexation est asynchrone.
- Les objectifs chiffrés de latence, disponibilité et rétention restent à définir avant la production.

## 9. Mesure du succès

Les seuils cibles sont à fixer après une première période de mesure. Les événements doivent être minimisés et ne pas inclure le texte sensible des conversations.

- **Activation :** part des nouveaux comptes qui terminent ou passent l'onboarding puis envoient une première demande.
- **Valeur récurrente :** utilisateurs qui reviennent et consultent ou modifient leur contexte au fil du temps.
- **Utilité perçue :** demandes résolues, actions ouvertes après une réponse et appréciation facultative de la réponse.
- **Confiance :** taux d'utilisation des contrôles de mémoire, réclamations liées à une mémoire erronée, révocations d'intégration.
- **Qualité opérationnelle :** taux d'erreur et de réponse incomplète, latence médiane et au 95e percentile.
- **Accessibilité :** réussite des parcours essentiels au clavier et sous mouvement réduit.

La rétention n'est pas un indicateur suffisant à elle seule : elle doit être lue avec l'utilité et la confiance.

## 10. Périmètre de livraison

### MVP — Assistant personnel textuel contrôlable

Compte et session, onboarding persistant, profil/préférences, assistant textuel avec historique et contexte de profil, mémoire inspectable/supprimable, projets et tâches minimaux, navigation Assistant/Workspace, réglages essentiels, états d'erreur/chargement/vides et exigences d'accessibilité.

### Version suivante

Documents et recherche, première intégration validée, modules My Day et AI News/Job Watch selon la disponibilité de leurs sources et la validation de leur valeur.

### Évolutions

Voix, lip-sync, avatar animé final, intégrations supplémentaires, proactivité planifiée et modèle économique. Chacune nécessite une décision de périmètre, de confidentialité et de coûts.

## 11. Décisions ouvertes

1. Modèle économique, quotas et limites d'usage.
2. Fournisseur de stockage objet et limites d'upload.
3. Fournisseur et dimension des embeddings.
4. Transport de streaming et stratégie de reprise après coupure.
5. Fournisseur OAuth prioritaire, scopes et accès en lecture/écriture.
6. Politique de conservation, export, suppression du compte et sauvegardes.
7. Niveau d'initiative par défaut et gestion des suggestions proactives.
8. Fournisseur STT/TTS, voix et éventuel mode mains libres.
9. Avatar final et contraintes de performance associées.
10. Seuils chiffrés des indicateurs et critères de lancement public.

## 12. Références

- Vision et parcours existants : [`product.md`](product.md)
- Phasage de livraison : [`roadmap.md`](roadmap.md)
- Entités et relations : [`data-model.md`](data-model.md)
- Contraintes techniques : [`architecture.md`](architecture.md)
- Écrans, comportements et tokens du handoff : [`../design_handoff_mimir/README.md`](../design_handoff_mimir/README.md)
- Charte visuelle consolidée : [`CHARTE-GRAPHIQUE.md`](CHARTE-GRAPHIQUE.md)
