# Mímir - Modèle de données

Le schéma Prisma complet se trouve dans `packages/db/prisma/schema.prisma`.

## Tables principales

### Utilisateurs et profils

| Table | Rôle |
|-------|------|
| User | Compte utilisateur (email, nom). Point d'ancrage de toutes les données. |
| Profile | Profil détaillé : ville, activité, compétences, style de communication. Un par utilisateur. |
| Preference | Clé-valeur extensible par utilisateur. Utilisable par les modules pour stocker des configurations spécifiques. |

### Objectifs et projets

| Table | Rôle |
|-------|------|
| Goal | Objectifs court ou long terme avec statut et deadline. |
| Project | Entité structurée : nom, description, stack, URLs, lien GitHub. Peut contenir des documents et des intégrations. |
| Task | Tâche rattachable à un projet ou indépendante. Statut, priorité, deadline. |

### Documents

| Table | Rôle |
|-------|------|
| Document | Métadonnées du fichier (titre, type, MIME, taille, clé stockage). Le fichier original est dans le stockage objet. `projectId` null = document personnel. |
| DocumentChunk | Morceau de texte extrait d'un document, avec métadonnées de position. La colonne embedding (vecteur) sera ajoutée quand le fournisseur sera choisi. |

### Conversations

| Table | Rôle |
|-------|------|
| Conversation | Fil de discussion entre l'utilisateur et Mímir. |
| Message | Message individuel (rôle : user, assistant, system). |

### Mémoire

| Table | Rôle |
|-------|------|
| Memory | Fait, préférence, événement ou observation retenu par Mímir. La colonne embedding sera ajoutée avec DocumentChunk. |

### Modules

| Table | Rôle |
|-------|------|
| Module | Module disponible dans Mímir (My Day, AI News, etc.). |
| UserModule | Activation et configuration d'un module pour un utilisateur. |

### Intégrations

| Table | Rôle |
|-------|------|
| Integration | Service externe disponible (GitHub, Google, Notion). |
| UserIntegration | Connexion d'un utilisateur à un service (tokens OAuth, statut). |
| ProjectIntegration | Liaison entre un projet et un service externe (ex: un repo GitHub lié à un projet). |

## Relations clés

- Un `Document` avec `projectId` null est un document personnel. Avec un `projectId`, il appartient à ce projet.
- Les `DocumentChunk` sont supprimés en cascade avec leur `Document`.
- Les `Task` peuvent exister sans projet (`projectId` nullable).
- Chaque `UserIntegration` stocke les tokens OAuth. Les tokens devront être chiffrés en production.
- `ProjectIntegration` relie un projet à un service externe via un `externalId` (ex: repo GitHub).
