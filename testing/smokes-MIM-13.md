# Smoke tests -- MIM-13 (Implementer la machine d'etat simulee)

> Ces scenarios sont ecrits **avant** l'implementation (test-first).
> Ils s'executent **apres**, app lancee dans le navigateur.

## Preconditions generales

- App lancee (`pnpm dev`)
- Navigateur ouvert sur `http://localhost:5173`

---

### Curseur clignotant pendant la revelation -- tranche manuelle (le clignotement visuel)

> **Ce qu'on verifie :** que le curseur clignote reellement a l'ecran pendant que la reponse se revele mot a mot. La presence et la disparition du curseur sont couvertes en auto ; le clignotement lui-meme est une animation CSS que jsdom n'execute pas, il faut donc le voir a l'oeil.

**Preconditions**
- Etre sur l'ecran Assistant (route `/mimir`)
- Mimir au repos (etat idle)

**Etapes**
1. Saisir un message dans le Composer et l'envoyer.
2. Laisser passer les etats listening, thinking, processing jusqu'a l'arrivee en Responding.
3. Pendant que le texte de la reponse apparait mot a mot, observer le curseur en bout de texte.
4. Attendre la fin de la revelation (texte complet affiche).

**Resultat attendu**
- Un curseur est visible en bout de texte pendant toute la revelation.
- Le curseur clignote a un rythme regulier (apparait/disparait) de maniere fluide, sans a-coup.
- Des que le texte est entierement revele, le curseur s'arrete de clignoter et disparait.

- [ ] Passe
