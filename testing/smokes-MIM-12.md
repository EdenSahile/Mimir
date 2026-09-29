# Smoke tests -- MIM-12 (Construire l'Assistant)

> Ces scenarios sont ecrits **avant** l'implementation (test-first).
> Ils s'executent **apres**, app lancee dans le navigateur.

## Preconditions generales

- App lancee (`pnpm dev`)
- Navigateur ouvert sur `http://localhost:5173/mimir`
- DevTools disponibles pour regler la taille du viewport

---

### La page ne defile jamais -- absence reelle de scroll

> **Ce qu'on verifie :** la scene tient dans le viewport a toutes les tailles. La part auto couvre les classes `overflow-hidden` / `min-h-0` sur la scene. La part manuelle couvre le fait qu'aucun contenu ne deborde reellement, ce que jsdom ne peut pas mesurer.

**Preconditions**
- Ecran Assistant en idle

**Etapes**
1. Regler le viewport a 1440x900. Tenter de defiler a la molette et avec la barre d'espace.
2. Regler le viewport a 1280x720, refaire le test.
3. Regler le viewport a 390x844 (mode responsive), tenter de defiler au doigt (drag).
4. Envoyer une demande, attendre l'etat Responding avec une reponse longue, retenter de defiler la page a chacune des 3 tailles.

**Resultat attendu**
- Aucune barre de defilement verticale sur la page, a aucune des 3 tailles, dans aucun etat.
- La page ne bouge pas a la molette ni au drag. Seule la zone de la reponse peut defiler.
- Aucun contenu coupe en bas de l'ecran.

- [ ] Passe

---

### Le Composer est toujours visible -- ancrage en bas

> **Ce qu'on verifie :** le Composer reste a l'ecran quel que soit l'etat et la hauteur de fenetre. La part auto couvre sa presence dans le DOM dans les 6 etats. La part manuelle couvre sa visibilite reelle, non poussee hors du viewport.

**Preconditions**
- Ecran Assistant en idle, viewport 1280x720

**Etapes**
1. Observer le Composer en bas de la scene en idle.
2. Envoyer une demande et suivre le cycle complet (listening, thinking, processing, responding, success, retour idle) sans quitter l'ecran des yeux.
3. Reduire la hauteur de fenetre a environ 600px et refaire un cycle complet.
4. Pendant l'etat Responding avec une reponse longue, verifier que le Composer est toujours a l'ecran et que son champ recoit le focus au clic.

**Resultat attendu**
- Le Composer est visible en permanence, ancre en bas de la scene, dans les 6 etats et aux 2 hauteurs.
- Il n'est jamais recouvert par la reponse ni pousse sous le bord bas de la fenetre.
- Le champ reste cliquable et focusable a tout moment.

- [ ] Passe

---

### L'avatar est le seul element flexible -- comportement au redimensionnement

> **Ce qu'on verifie :** l'avatar absorbe seul la variation de hauteur. La part auto couvre la fonction pure de calcul du max (480 ou 120) et la repartition des classes flex. La part manuelle couvre le redimensionnement reel.

**Preconditions**
- Ecran Assistant en idle, fenetre en hauteur confortable (>= 900px)

**Etapes**
1. Noter la taille de l'avatar, celle du `StateLabel` et celle du Composer.
2. Reduire progressivement la hauteur de la fenetre jusqu'a environ 600px.
3. Observer lesquels de ces blocs changent de taille.
4. Envoyer une demande, puis, a une hauteur de fenetre inferieure a 640px, observer la taille de l'avatar pendant la demande.
5. Agrandir la fenetre au-dela de 1000px de haut et observer l'avatar.

**Resultat attendu**
- Seul l'avatar change de taille au redimensionnement. `StateLabel`, `VoiceBars` et le Composer gardent la meme hauteur.
- L'avatar ne descend jamais sous 150px, meme a la hauteur minimale.
- Il ne depasse jamais 480px, meme sur une tres grande fenetre.
- Avec une demande en cours et une fenetre de moins de 640px de haut, l'avatar est nettement plus petit (environ 120px).

- [ ] Passe

---

### La reponse defile dans sa propre zone -- fondu bas et scroll masque

> **Ce qu'on verifie :** le rendu du `mask-image` et du defilement sans barre. La part auto couvre la presence du `max-height: 34vh`, de l'overflow et du style de masque. La part manuelle couvre leur effet visuel reel.

**Preconditions**
- Une demande dont la reponse depasse 34vh (question ouverte type "Resume-moi ma semaine")

**Etapes**
1. Envoyer la demande et attendre la fin de l'etat Responding.
2. Observer le bas de la zone de reponse pendant que le texte depasse la hauteur disponible.
3. Faire defiler a la molette a l'interieur de la zone de reponse.
4. Chercher une barre de defilement sur cette zone.
5. Verifier que la page complete, elle, n'a pas bouge.

**Resultat attendu**
- Le texte de la reponse s'estompe progressivement vers le bas, il n'est pas coupe net.
- La zone de reponse defile a la molette et laisse lire la fin du texte.
- Aucune barre de defilement visible sur cette zone.
- Le reste de la scene (avatar, Composer) n'a pas bouge pendant le defilement.

- [ ] Passe

---

### Composer voix -- glow du bouton micro

> **Ce qu'on verifie :** l'aspect du glow a l'etat actif. La part auto couvre la presence du bouton, sa taille, le basculement d'`aria-pressed` et l'application de la classe de glow. La part manuelle couvre la couleur et l'intensite percues.

**Preconditions**
- Composer bascule en mode voix

**Etapes**
1. Observer le bouton micro au repos : il est rond, d'environ 64px de diametre, avec l'indication "Appuyez et parlez".
2. Cliquer sur le bouton micro.
3. Observer le bouton actif : fond plus clair, bordure plus visible, halo lumineux autour.
4. Verifier que l'indication devient "Mimir vous ecoute".
5. Cliquer a nouveau pour revenir au repos et verifier que le halo disparait.

**Resultat attendu**
- Le bouton est parfaitement rond et suffisamment grand pour etre touche au doigt.
- A l'etat actif, le halo est visible sans etre eblouissant, dans la teinte claire du design system.
- La difference entre repos et actif est immediate, sans avoir a comparer.

- [ ] Passe

---

### ThreadDrawer -- ne recouvre jamais le visage

> **Ce qu'on verifie :** la geometrie du tiroir par rapport a l'avatar. La part auto couvre l'ouverture par le bouton pilule, le role `dialog` et la fermeture par Echap. La part manuelle couvre le non-recouvrement du visage.

**Preconditions**
- Au moins 2 echanges dans le fil (envoyer 2 demandes successives)
- Viewport 1280x720

**Etapes**
1. Cliquer sur le bouton pilule "Fil de l'echange · N" en bas de la scene.
2. Observer le tiroir qui s'ouvre sur la droite.
3. Verifier que le visage de l'avatar reste entierement visible, non couvert par le tiroir.
4. Repeter a 1440x900, puis a 1180px de large.
5. Presser la touche Echap et verifier la fermeture.

**Resultat attendu**
- Le tiroir se pose a droite de la scene, largeur d'environ 330px, fond flou.
- Le visage de l'avatar reste entierement degage aux 3 largeurs testees.
- Chaque entree affiche son role ("Vous" ou "Mimir") au-dessus du texte.
- Echap ferme le tiroir.

- [ ] Passe

---

### Panneaux ambiants -- seuil reel de 1180px et placement

> **Ce qu'on verifie :** le basculement au vrai seuil et le placement des panneaux. La part auto couvre l'affichage conditionnel avec `matchMedia` bouchonne et la disparition pendant une demande. La part manuelle couvre le seuil reel et la position a l'ecran.

**Preconditions**
- Ecran Assistant en idle, viewport large (1440px)

**Etapes**
1. Observer les 2 panneaux : "Aujourd'hui" en haut a gauche (3 evenements, heure en mono), "Contexte actif" en haut a droite (chips).
2. Reduire la largeur du viewport a 1181px : les panneaux sont encore la.
3. Reduire a 1179px : les panneaux disparaissent.
4. Remonter a 1440px, puis envoyer une demande.
5. Observer les panneaux pendant les etats listening, thinking, processing et responding.
6. Attendre le retour en idle.

**Resultat attendu**
- Les panneaux sont presents a 1181px et absents a 1179px.
- "Aujourd'hui" est en haut a gauche avec 3 evenements, "Contexte actif" en haut a droite avec des chips.
- Ils sont legerement attenues (opacite .82) sans gener la lecture ni voler l'attention a l'avatar.
- Ils disparaissent des le debut d'une demande et reviennent au retour en idle.

- [ ] Passe

---

### SpokenResponse -- aucune apparence de chat

> **Ce qu'on verifie :** la reponse ne ressemble pas a un message de chatbot. La part auto couvre l'absence d'element d'avatar et de conteneur de bulle dans le DOM. La part manuelle couvre l'absence de fond, de bordure ou de carte peints en CSS.

**Preconditions**
- Une reponse affichee (etat Responding termine)

**Etapes**
1. Observer la zone de reponse sous l'avatar.
2. Chercher un fond colore, une bordure, un coin arrondi ou une ombre de carte autour du texte.
3. Chercher une vignette ou une photo d'avatar a cote du texte de la reponse.
4. Comparer visuellement avec la demande affichee dans `RequestEcho` au-dessus de l'avatar.

**Resultat attendu**
- Le texte de la reponse est pose directement sur le fond de la scene, en serif, centre.
- Aucun rectangle, aucune bulle, aucune bordure, aucune ombre autour du texte.
- Aucune vignette d'avatar a cote du message.
- L'ensemble se lit comme une parole, pas comme un fil de conversation.

- [ ] Passe

---

### Seuils de hauteur -- greeting et libelle "Votre demande"

> **Ce qu'on verifie :** les 2 seuils de hauteur de viewport. La part auto couvre les fonctions pures de decision testees sur leurs bornes et l'affichage conditionnel avec `matchMedia` bouchonne. La part manuelle couvre le comportement au redimensionnement reel et l'equilibre de la scene apres disparition.

**Preconditions**
- Ecran Assistant en idle, fenetre d'au moins 800px de haut

**Etapes**
1. Verifier que le greeting "Bonjour [prenom]." en serif est affiche.
2. Reduire la hauteur de la fenetre a 720px : le greeting est toujours la.
3. Reduire a 680px : le greeting disparait.
4. Envoyer une demande avec la fenetre a 680px : le libelle mono "Votre demande" est affiche au-dessus de la demande.
5. Reduire la hauteur a 620px pendant qu'une demande est en cours : le libelle "Votre demande" disparait, le texte de la demande reste.
6. Remonter la fenetre a 800px et verifier que les 2 elements reviennent.

**Resultat attendu**
- Le greeting est present au-dessus de 700px de haut et absent en dessous.
- Le libelle "Votre demande" est present au-dessus de 640px de haut et absent en dessous, tandis que la demande elle-meme reste toujours visible.
- Apres chaque disparition, la scene reste centree et equilibree, sans trou ni saut brusque.

- [ ] Passe

---

### Mobile -- espace 84px reserve pour la BottomBar

> **Ce qu'on verifie :** le Composer n'est pas mange par la BottomBar sur mobile. La part auto couvre la presence de la reserve de 84px sur le conteneur de la scene. La part manuelle couvre l'absence de recouvrement reel et la cliquabilite.

**Preconditions**
- Mode responsive du navigateur, viewport 390x844

**Etapes**
1. Observer le bas de l'ecran : la BottomBar et, au-dessus, le Composer.
2. Verifier qu'un espace separe le Composer de la BottomBar, sans chevauchement.
3. Toucher le champ du Composer et verifier qu'il prend le focus au premier essai.
4. Toucher chaque `SuggestionChip` et verifier qu'aucun n'est partiellement cache par la BottomBar.
5. Envoyer une demande et refaire les etapes 2 et 3 pendant l'etat Responding.

**Resultat attendu**
- Le Composer est entierement visible, jamais recouvert par la BottomBar.
- Les chips sont toutes entierement visibles et cliquables.
- Le champ prend le focus au premier toucher, sans avoir a viser au-dessus de la zone attendue.
- L'avatar fait environ 296px de haut sur ce viewport.

- [ ] Passe
