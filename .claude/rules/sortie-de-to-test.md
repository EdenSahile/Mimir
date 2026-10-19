# Sortie de TO TEST : ce qui fait passer un ticket en DONE

`TO TEST` veut dire : **le code existe, et rien ne confirme encore qu'il fonctionne la ou l'utilisateur le verra.** Ce fichier dit a quelles conditions un ticket quitte cette colonne, parce que sans condition ecrite elle ne fait que grossir.

Ecrit le 2026-10-19 en le testant contre **MIM-12 (Assistant)** et **MIM-13 (machine d'etat simulee)**, les 2 cas les plus durs de la colonne, et non contre les tickets visuels. Un critere ecrit en regardant les tickets qu'on s'apprete a valider est un critere qu'ils passent par construction.

## Les 5 portes, dans cet ordre

L'ordre compte : chaque porte rend la suivante interpretable. Une porte franchie ne se presume pas d'une autre.

### 1. Les criteres du ticket decrivent ce qui existe

Avant de verifier quoi que ce soit, relire les criteres d'acceptation **contre le code**. Les tickets MIM-5 a MIM-13 ont ete ecrits le 2026-09-23 : un critere peut avoir ete remplace, abandonne, ou renomme depuis.

- Si un critere ne decrit plus ce qui existe, **mettre a jour le critere dans le ticket et consigner le changement** (ce qui a change, et pourquoi), **avant** toute validation.
- Si un critere decrit quelque chose d'absent, le ticket n'est pas en TO TEST : il est inachevé, et il retourne en `TODO` ou `DOING`.
- Valider contre une specification perimee produit un vert qui ne veut rien dire. C'est la meme erreur que mesurer un empaquetage dans des logs de build : la mauvaise reference.

**Test sur MIM-13 :** son critere « Hook `useMimirConversation()` dans `logic/` » decrit bien `apps/web/src/logic/assistant/useMimirConversation/`. Il passe cette porte.

**Test sur MIM-12 :** sa description nomme `RequestEcho`, `SuccessPill` et `SuggestionChips`. Les 2 premiers n'apparaissent nulle part dans `apps/web/src`. Ce ticket echoue la porte 1, et aucune des suivantes n'a de sens pour lui.

### 2. Les tests automatises de ce ticket existent et passent

Pas « la suite passe » : **les tests de ce ticket**. Une suite verte ou les tests du ticket n'existent pas est un indicateur, pas une preuve. Les nommer : fichiers, et criteres couverts.

### 3. Les verifications manuelles sont faites, une par une

Chaque scenario de `testing/smokes-MIM-X.md` est joue et sa case cochee, ou declare non applicable avec son motif. Une case vide vaut non fait.

Un ticket dont le fichier de strategie porte encore des `⬜` ne sort pas de TO TEST : le suivi n'est pas un formulaire, c'est l'etat du travail.

### 3 bis. Ou va un ticket qui echoue la porte 1 : `TODO` ou `DOING`

La distinction ne porte pas sur la quantite de travail restante, mais sur **ce qui existe deja et sur ce qui en depend**.

- **`TODO`** : rien n'existe pour ce ticket, et rien d'autre ne s'appuie dessus. Le reprendre ne demande de defaire aucun choix.
- **`DOING`** : du code existe et porte des decisions, ou un autre ticket en depend. `TODO` ferait croire qu'il n'y a rien a lire avant de continuer, et quelqu'un repartirait de zero sur un terrain deja occupe.

Cas du 2026-10-19 : **MIM-12 passe en `DOING`**, pas en `TODO`. 3 des composants de sa description sont absents, mais `Assistant.tsx`, `Composer`, `SpokenResponse` et `ThreadDrawer` existent avec leurs tests, et le hook de MIM-13 en depend.

### 4. Verifie sur un deploiement, pas seulement en local

C'est le sens meme de la colonne. Un smoke passe en developpement **n'est pas** une validation de deploiement : il ne traverse ni le build de production, ni l'empaquetage, ni la configuration de l'environnement.

Ca vaut particulierement depuis le 2026-10-18, ou l'architecture de deploiement a entierement change : 2 services Vercel, bundle esbuild, passerelle d'entrypoint, champs de build du projet. Tout ce qui a ete valide en developpement avant cette date l'a ete sur un chemin qui n'existe plus.

L'environnement de verification est celui ou les criteres du ticket s'appliquent, et il est **nomme** dans le ticket : preview pour une interface sans donnee de production, production quand le critere porte sur elle. Un DONE pose sur un preview se lit « valide en preview », et le ticket le dit (voir MIM-23, qui porte sa limite ecrite).

**Cette porte est une session de verification, pas une tache par ticket.** Un deploiement se regarde une fois et couvre tous les tickets dont les ecrans y sont visibles : on ouvre l'application deployee, on parcourt les ecrans, et on note le resultat dans chaque ticket concerne. Compter cette porte une fois par ticket surestime le travail et pousse a la sauter.

Elle ne discrimine donc rien quand elle echoue pour tout le monde en meme temps. Au 2026-10-19, les 8 tickets en TO TEST l'echouent **par construction** : l'API n'est deployee que depuis la veille, donc aucun ecran n'avait d'environnement complet ou etre verifie. Dans ce cas, ce qui classe les tickets est la premiere porte echouee **avant** la 4.

### 5. Le resultat est consigne dans le ticket

L'URL du deploiement, la date, et ce qui a ete regarde. Un DONE sans trace est un DONE qu'il faudra refaire au premier doute.

## Aucune estimation de cout avant mesure

Ne pas annoncer qu'une validation « sera rapide » : le mesurer, puis l'annoncer. L'argument « les smokes ont ete faits pendant le dev, il ne reste qu'a verifier sur le deploiement » a exactement la forme du raisonnement qui a echoue 2 fois la semaine du 2026-10-18, celle qui conclut depuis un indicateur voisin au lieu de la chose elle-meme.

## Ce que ca ne change pas

Les statuts Notion restent la decision de l'utilisateur. Cette rule dit a quelles conditions un passage en DONE est **defendable**, elle n'autorise personne a le faire a sa place.
