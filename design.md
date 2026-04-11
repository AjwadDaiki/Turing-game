# TURING — Design System & Direction Artistique

> Direction artistique : **Le dossier d'interrogatoire vintage**. Salle d'enquête années 70-80, métal gris-vert, lampe orange chaude, dossiers confidentiels, tampons rouges, polaroids, machine à écrire. Ambiance X-Files croisé Blade Runner original.

---

## 1. Philosophie visuelle

Le joueur est un **enquêteur dans un bureau secret**. Il interroge des suspects pour démasquer une IA infiltrée et son complice humain. Chaque épreuve est un **test d'interrogatoire**, chaque réponse une **pièce à conviction** qui s'accumule sur le bureau. La DA doit faire ressentir la **gravité ludique** d'une enquête : sérieuse en apparence, absurde et drôle dans les moments de révélation.

Trois principes directeurs :
1. **Rien n'est stérile.** Chaque surface a une texture, une imperfection, une trace de vécu.
2. **Chaud et froid en contraste.** Le métal froid du bureau contrasté par la lampe chaude orangée qui crée un halo au centre.
3. **Le papier est roi.** Toutes les infos importantes s'affichent sur du papier, des fiches, des polaroids — jamais sur des "écrans digitaux" classiques.

---

## 2. Palette de couleurs

### Couleurs principales (à utiliser constamment)

```
--bg-metal-dark       #1C201D   (noir vert des coins sombres du bureau)
--bg-metal-mid        #2E3530   (gris vert du plateau métallique)
--bg-metal-light      #3F4841   (gris vert éclairé par la lampe)
--paper-cream         #E8DCC0   (papier jauni principal des fiches)
--paper-white         #F2EAD3   (papier plus frais des polaroids)
--paper-shadow        #A89878   (ombre portée sous les papiers)
--ink-black           #1A1612   (encre de la machine à écrire)
--stamp-red           #B0261C   (rouge tampon, saturé mais sale)
--stamp-red-dark      #7A1A12   (rouge tampon pour ombres)
--lamp-orange         #E8954A   (halo de la lampe, chaud)
--lamp-orange-glow    #FFCB88   (centre du halo, très chaud)
--accent-green        #4A6B3D   (vert militaire discret pour confirmations)
```

### Règles d'usage
- **Fond global** : un dégradé radial du centre (`--lamp-orange` à 10% d'opacité) vers les bords (`--bg-metal-dark`), simulant la lampe qui éclaire le centre du bureau
- **Texte principal** : toujours `--ink-black` sur papier, jamais sur fond métal
- **Texte sur métal** : `--paper-cream` en très petit, réservé aux infos secondaires (timer, pseudo du joueur)
- **Rouge des tampons** : jamais utilisé pour du texte de règles, uniquement pour les marquages (suspicions, validations)

---

## 3. Typographie

### Polices à utiliser

**Courier Prime** (Google Fonts) — typo principale de toutes les réponses et textes d'interrogatoire. Effet machine à écrire vintage. Poids 400 et 700.

**Special Elite** (Google Fonts) — alternative machine à écrire plus "tapée fort", pour les titres d'épreuves et les en-têtes de formulaires. Donne un côté bureau gouvernemental.

**Permanent Marker** (Google Fonts) — UNIQUEMENT pour les mots manuscrits en rouge ("CLASSIFIED", "URGENT", le "X" des votes). À utiliser avec parcimonie, 2-3 mots par écran max.

### Hiérarchie

```
H1 (titre d'épreuve)   Special Elite, 48px, --ink-black
H2 (sous-titre)        Special Elite, 24px, --ink-black
Body (réponses joueur) Courier Prime 400, 18px, --ink-black
Mono (pseudos, timer)  Courier Prime 700, 14px, --paper-cream
Stamps (rouge)         Permanent Marker, 32px, --stamp-red rotation random ±5°
```

Tout le texte sur papier doit avoir un très léger effet "imperfection d'encre" (micro-bruit sur les contours, 2-3% opacity noise). Jamais de texte parfaitement net.

---

## 4. Textures & assets clés

### Textures réutilisables (à générer ou sourcer)

1. **Texture métal brossé gris-vert** — fond principal du bureau, avec rayures subtiles horizontales
2. **Texture papier crème jauni** — pour toutes les fiches et formulaires, avec fibres visibles
3. **Texture polaroid** — cadre blanc mat + léger vignetage au centre de la photo
4. **Texture carton** — pour les dossiers officiels et cartes de rôle
5. **Texture bruit noir-grain** — à appliquer en overlay sur toute la scène à 3% d'opacité (donne un côté film analogique)

### Objets décoratifs du bureau (fond persistant)

Dispersés autour de l'écran principal, fixes mais discrets :
- Un cendrier en verre avec 2 mégots
- Une tasse de café à moitié vide, tache circulaire sur le bureau
- Une règle métallique oxydée
- Un trombone qui traîne
- Un vieux téléphone à cadran en bas à gauche (purement décoratif)
- Un stylo Bic rouge avec capuchon mâchouillé
- Un petit tas de cendre
- Un post-it jauni avec "NE PAS OUBLIER" écrit au stylo

Ces objets sont **collés au décor** et ne bougent jamais. Ils donnent l'impression d'un bureau réel et habité.

---

## 5. Écrans clés

### 5.1 — Écran d'accueil / lobby

Vue plongeante du bureau vide, éclairé par la lampe au centre. Au milieu, une **enveloppe kraft** scellée d'un tampon rouge "OPERATION TURING". Bouton "OUVRIR LE DOSSIER" qui déclenche une animation d'ouverture d'enveloppe.

Pour rejoindre une room : un code à 6 caractères en Courier, affiché comme tapé sur une machine à écrire dans un champ de formulaire papier.

Pour créer une room : bouton "NOUVEAU DOSSIER" style étiquette tamponnée.

### 5.2 — Écran de rôle (début de partie, 3 sec)

Une **carte d'identification officielle** se retourne au centre de l'écran avec une animation fluide (rotation Y 180°).

**Si Civil** : carte crème avec marge bleue, photo floue en noir et blanc (silhouette générique), texte tamponné "AGENT CIVIL - ENQUÊTEUR", le pseudo du joueur, un numéro matricule random.

**Si Traître** : carte crème avec marge rouge, photo floue avec un rectangle noir censurant les yeux, texte tamponné "INFILTRÉ" en rouge diagonal, nom de code secret en gros (ex: "AGENT UNIT-07"), puis en bas en petit : "Mission : te faire passer pour l'IA".

La carte reste visible 3 secondes puis s'envole vers le haut de l'écran (elle sera accessible en cliquant sur un petit badge dans le coin pendant toute la partie, discret).

### 5.3 — Écran d'épreuve

Le centre de l'écran affiche un **formulaire d'interrogatoire** en papier crème, centré sur le bureau. En-tête du formulaire :

```
┌─────────────────────────────────────┐
│  DOSSIER N° 2847-B    MANCHE 03/05  │
│  ─────────────────────────────────  │
│         QUESTION 03                 │
│  "UN MOT POUR DÉCRIRE LUNDI MATIN"  │
│                                     │
│  RÉPONSE DU SUJET :                 │
│  ┌───────────────────────────────┐  │
│  │ [champ de saisie]             │  │
│  └───────────────────────────────┘  │
│                                     │
│           [VALIDER]                 │
└─────────────────────────────────────┘
```

Le titre de la question est en Special Elite. Le champ de saisie a l'air d'une ligne de formulaire papier à compléter au stylo. Quand le joueur tape, chaque lettre apparaît avec un **son "clack" de machine à écrire** et une micro-animation (bounce de 2px).

**Timer** : dans le coin en haut à droite, une horloge circulaire analogique avec une aiguille qui tourne. Le cercle rougit progressivement à mesure que le temps s'écoule.

**Liste des autres joueurs** : à droite de l'écran, une petite colonne de "fiches suspects" miniatures avec leur pseudo et un voyant (vert = a validé, gris = en cours).

### 5.4 — Écran de défilement (entre manches)

Le formulaire disparaît, remplacé par une vue plus large du bureau. Une pile de **polaroids** apparaît au centre, légèrement empilée de manière désordonnée.

Le bouton de l'hôte "SUIVANT" est un **tampon rouge** stylisé en bas à droite qui fait un son d'estampage quand on clique.

À chaque clic "Suivant", un polaroid du dessus se détache et se retourne avec une animation 3D, révélant la réponse du joueur :

- Le polaroid montre en haut le **pseudo du joueur** tapé à la machine sur une étiquette
- Au centre, la **réponse** (mot, dessin, emoji, couleur, etc. selon l'épreuve) dans un style cohérent avec le médium
- Un effet très subtil de "ombre projetée" sous le polaroid

Les polaroids révélés restent visibles à l'écran, disposés sur le bureau en grille lâche (légèrement éparpillés, pas alignés parfaitement). Le joueur peut cliquer sur n'importe quel polaroid pour appliquer un tampon :

**Bouton Robot 🤖** : apparaît en bas à gauche sous forme de tampon circulaire "ROBOT SUSPECT" — quand on clique dessus puis sur un polaroid, un grand tampon rouge "ROBOT" se pose dessus avec un angle aléatoire ±10° et un son satisfaisant.

**Bouton Ninja 🥷** : idem, tampon "COMPLICE" en noir. Angle random, son distinct du rouge.

Un joueur ne peut tamponner qu'une seule fois par manche avec chaque tampon, et un seul des deux par polaroid.

### 5.5 — Écran de récapitulatif général (avant vote final)

Le bureau se recule en dézoomant. On voit **toutes les fiches de toutes les manches**, disposées en grille 5×N (5 manches × N joueurs). Chaque colonne = un joueur (son pseudo en en-tête), chaque ligne = une manche.

Les joueurs peuvent hover/tap sur une fiche pour l'agrandir temporairement et bien la voir. Un timer 20 secondes en haut à droite.

### 5.6 — Écran de vote final

Une **fiche de vote officielle** apparaît au centre, imprimée en bleu pâle sur papier crème :

```
┌──────────────────────────────┐
│     VOTE FINAL — URGENT      │
│  ──────────────────────────  │
│                              │
│  QUI EST LE ROBOT ? 🤖       │
│  ○ Lucas                     │
│  ○ Sarah                     │
│  ○ Marco                     │
│  ○ Emma                      │
│                              │
│  QUI EST LE COMPLICE ? 🥷    │
│  ○ Lucas                     │
│  ○ Sarah                     │
│  ○ Marco                     │
│  ○ Emma                      │
│                              │
│       [CONFIRMER]            │
└──────────────────────────────┘
```

Quand le joueur sélectionne un nom, un petit "✓" manuscrit au stylo rouge apparaît dans le cercle à côté (Permanent Marker font).

### 5.7 — Écran de révélation

Écran noir pendant 2 secondes. Puis au centre, l'annonce cinématographique en Special Elite, taille 64px :

```
LE ROBOT ÉTAIT...
```

Pause d'une seconde, puis la carte d'identité du joueur IA apparaît en grand avec son nom de code "UNIT-07" en rouge tamponné.

Pause de 2 secondes.

```
LE COMPLICE ÉTAIT...
```

Idem pour le Traître, avec son nom de code secret révélé.

### 5.8 — Écran de scores

Retour au bureau vu du dessus. Un **dossier final** s'ouvre au centre et révèle une liste tapée à la machine :

```
RAPPORT D'ENQUÊTE — CLASSEMENT

RANG 1 │ LUCAS ............ 245 pts
       │ "LE DÉTECTIVE"
       │
RANG 2 │ SARAH ............ 180 pts  
       │ "LE CHAOS"
       │
RANG 3 │ MARCO ............ 155 pts
       │ "L'INDÉCIS"
```

Chaque ligne s'affiche avec un son de machine à écrire qui tape. Le gagnant a un tampon rouge "GAGNANT" sur son nom.

En bas, deux boutons tamponnés : "NOUVEAU DOSSIER" (relancer) et "COPIER LE RAPPORT" (partager).

---

## 6. Sons (cruciaux pour l'immersion)

Le son est **la moitié de la DA**. Sans les bons sons, le visuel perd 60% de son impact.

### Sons à intégrer

- **Clack machine à écrire** : à chaque frappe de touche dans les champs de saisie
- **Ding de fin de ligne** : quand le joueur valide sa réponse
- **Tampon** : son grave "clunk" d'un vrai tampon en bois
- **Polaroid qui se retourne** : léger "fwip" papier
- **Polaroid qui tombe sur la table** : léger "tap"
- **Dossier qui s'ouvre** : son de papier qui se déplie
- **Ambiance de fond permanente** : ventilateur lointain, ticking d'une horloge murale, très discret (-30dB)
- **Lampe qui bourdonne** : grésillement électrique très subtil en continu
- **Musique de tension montante** : une nappe très discrète qui monte progressivement au fil des 5 manches, avec un beat de métronome qui s'accélère légèrement
- **Révélation finale** : un son dramatique court type "zoom cinématographique" vintage

---

## 7. Animations et transitions

- **Papier qui apparaît** : toujours avec un léger effet de "dépose" (ombre qui se forme, micro-rotation ±2°)
- **Tampon qui se pose** : échelle 120% → 100% avec easing élastique, rotation random, son synchronisé
- **Transition entre manches** : fondu court avec un effet "ventilateur" qui balaie l'écran
- **Timer** : l'aiguille de l'horloge tourne de manière continue et lisse, pas par sauts
- **Révélation de carte** : rotation 3D fluide sur l'axe Y, 0.8 sec
- **Texte machine à écrire** : toujours affiché lettre par lettre avec 40-60ms d'intervalle, jamais d'un bloc

### Micro-interactions
- **Hover sur un polaroid** : légère élévation (+4px en Y) + ombre accentuée
- **Click sur un tampon** : feedback immédiat de "pression" (scale 95% pendant 100ms)
- **Validation d'une réponse** : le champ de saisie "flash" brièvement en vert militaire

---

## 8. Responsive et mobile

Sur mobile, le bureau reste le même mais simplifié : moins d'objets décoratifs (on garde le cendrier, la tasse, le post-it). Les polaroids deviennent plus grands et s'empilent verticalement au lieu d'horizontalement. Les tampons de suspicion sont en bottom sheet fixe.

Tous les clics deviennent des taps. Les animations de rotation restent les mêmes. Les sons sont maintenus (important pour l'immersion même sur mobile).

Breakpoint critique : **768px**. Au-dessus, layout bureau horizontal. En dessous, layout vertical empilé.

---

## 9. Moodboard de références

Pour l'équipe qui implémente, chercher des références visuelles via ces mots-clés :
- "Blade Runner 1982 office interior"
- "X-Files case file"
- "1970s detective desk"
- "Polaroid evidence board"
- "Film noir interrogation room"
- "Classified document stamps"
- "Vintage typewriter close-up"
- "Soviet era bureaucratic forms"

**Films à regarder pour l'ambiance** : Blade Runner (1982), Se7en, The X-Files (saisons 1-3), Zodiac, The Lives of Others, Tinker Tailor Soldier Spy.

---

## 10. Règle d'or

Si un élément visuel pourrait exister dans le bureau d'un enquêteur des années 80, il a sa place dans ce jeu. Si un élément ressemble à une app web moderne (dégradé, glassmorphism, bordure arrondie clean, icônes flat modernes), il faut le retirer ou le retravailler. **Aucun pixel de ce jeu ne doit trahir qu'il tourne dans un navigateur Chrome en 2026.**
