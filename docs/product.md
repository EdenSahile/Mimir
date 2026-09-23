# Mímir - Vision produit

## Ce que c'est

Mímir est une application web d'assistant personnel IA. Chaque utilisateur possède son propre Mímir, personnalisé selon son profil, ses objectifs, ses projets et ses préférences.

## Principe fondamental

Mímir est générique. Aucune donnée ni logique spécifique à un utilisateur particulier n'est codée en dur. Le moteur fonctionne pour n'importe quel profil :

- Un product owner en recherche d'emploi
- Un entrepreneur qui gère ses clients
- Un étudiant qui organise ses cours
- Un freelance qui suit ses projets

## Ce que Mímir fait pour l'utilisateur

- Répondre à ses questions avec le contexte de son profil, ses projets et ses documents
- Retenir des informations d'une conversation à l'autre (mémoire)
- Analyser ses documents personnels (CV, certifications, etc.)
- Organiser ses objectifs, projets et tâches
- Proposer une routine quotidienne personnalisée (veille, agenda, focus)
- Se connecter à ses outils (Google Calendar, Gmail, GitHub, Notion, etc.)

## Architecture produit

Le produit se compose de :

1. **Mímir Core** : authentification, profils, préférences, objectifs, projets, tâches, mémoire, conversations, orchestrateur IA, modules, intégrations
2. **Modules** : fonctionnalités activables par l'utilisateur (My Day, AI News, Job Watch, etc.)
3. **Intégrations** : connexions à des services tiers (Google, GitHub, Notion, etc.)

## Parcours utilisateur

1. Inscription et onboarding (interview en plusieurs étapes pour construire le profil)
2. Configuration des préférences et des objectifs
3. Activation des modules pertinents
4. Conversation avec Mímir (chat contextuel)
5. Upload de documents
6. Connexion d'intégrations
7. Utilisation quotidienne (routine matinale, gestion de tâches, etc.)
