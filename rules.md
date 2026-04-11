# TURING — Règles complètes & spécifications d'implémentation

> Party game web multijoueur où une IA se cache parmi les joueurs, et où un joueur humain doit se faire passer pour une IA. Trouvez les deux avant la fin.

---

## 1. Pitch en une phrase

Parmi vous, une IA se cache. Et un joueur humain a pour mission secrète de jouer comme une IA. À travers une série de micro-épreuves, démasquez le Robot 🤖 et le Traître 🥷 avant le vote final.

---

## 2. Configuration d'une partie

### Nombre de joueurs
- **Minimum :** 4 joueurs humains
- **Optimal :** 5 à 7 joueurs humains
- **Maximum :** 8 joueurs humains
- **+1 IA invisible** jouée par Groq Llama 3 8B (ajoutée automatiquement au pool de "participants" visibles à l'écran comme un joueur normal avec un pseudo généré)

### Rôles distribués au début
À la création de la partie, le système attribue en secret :
- **1 joueur humain = Traître (Ninja 🥷)** — doit se faire passer pour l'IA
- **Tous les autres joueurs humains = Civils** — doivent démasquer l'IA et le Traître
- **L'IA = Robot 🤖** — pilotée par Groq, joue comme si elle était humaine

Les rôles sont **fixes pour toute la partie** (pas de rotation entre les manches).

### Rôle de l'hôte
L'hôte est simplement le **créateur de la room**. Il joue normalement (il a un rôle attribué comme les autres, Civil ou Traître). Sa seule différence : pendant la **phase de défilement** des réponses entre chaque manche, c'est lui qui clique "Suivant" pour faire avancer le défilement au rythme voulu par le groupe.

---

## 3. Structure d'une partie

Une partie = **5 manches enchaînées + 1 vote final + 1 révélation**

### Vue d'ensemble chronologique

```
1. Écran "Carte de rôle" (3 sec)
2. Écran "Règles courtes" (5 sec, skippable)
3. Manche 1 : Épreuve → Défilement + Suspicions
4. Manche 2 : Épreuve → Défilement + Suspicions
5. Manche 3 : Épreuve → Défilement + Suspicions
6. Manche 4 : Épreuve → Défilement + Suspicions
7. Manche 5 : Épreuve → Défilement + Suspicions
8. Écran "Récapitulatif général" (20 sec)
9. Vote final (30 sec)
10. Révélation des rôles (10 sec)
11. Révélation des scores (30 sec)
12. Écran "Nouvelle partie ?"
```

**Durée totale estimée : 4 à 5 minutes par partie.**

---

## 4. Les 5 manches — déroulé détaillé

Chaque manche se compose de deux phases : **l'épreuve** et le **défilement avec suspicions**.

### Phase A — L'épreuve (12 à 20 sec selon le type)

1. Le titre de l'épreuve apparaît en plein écran (ex: "Un mot pour décrire lundi matin")
2. Un timer visuel démarre (cercle qui se vide)
3. Chaque joueur répond sur son écran, en aveugle (personne ne voit les réponses des autres)
4. Dès qu'un joueur valide, un petit ✓ discret apparaît à côté de son pseudo dans la liste latérale
5. Si le timer atteint 0 avant qu'un joueur ait validé, sa réponse est envoyée vide ou en l'état
6. **L'IA (Groq) répond en parallèle**, déclenchée en même temps que l'apparition de l'épreuve. Son temps de réponse doit être randomisé entre 3 et 12 secondes pour paraître humain (pas instantané, pas le dernier non plus).

### Phase B — Défilement + Suspicions (30 sec)

1. Transition visuelle : les réponses sont "collectées" et apparaissent sur un bureau d'enquête (cf. design.md)
2. L'hôte contrôle le défilement avec un bouton **"Suivant"**
3. Les réponses sont révélées **une par une, dans un ordre aléatoire** (pas l'ordre des joueurs, pas l'ordre alphabétique — random à chaque manche)
4. Chaque réponse révélée affiche :
   - Le pseudo du joueur
   - Sa réponse (dans sa forme brute : majuscules, fautes, emojis, tout est préservé)
   - Un effet visuel satisfaisant (estampage, polaroid qui tombe, etc.)
5. Une fois qu'une réponse est révélée, **elle reste visible à l'écran** et s'ajoute à la grille de la manche. À la fin du défilement, toutes les réponses de la manche sont visibles ensemble.
6. Pendant tout le défilement, **chaque joueur peut cliquer une seule fois** sur :
   - 🤖 **Bouton Robot** : désigne la réponse qu'il pense venir de l'IA
   - 🥷 **Bouton Ninja** : désigne la réponse qu'il pense venir du Traître humain
7. Les votes sont **anonymes et silencieux** — personne ne voit qui a voté quoi, ni combien de votes chaque réponse a reçu
8. Un joueur peut cliquer Robot OU Ninja sur une réponse, **pas les deux sur la même réponse** (force à se positionner)
9. Un joueur peut aussi ne rien cliquer (pas obligatoire)
10. L'hôte clique "Manche suivante" quand il estime que le défilement est fini (ou un timer auto passe à 30 sec)

---

## 5. Les 12 épreuves du pool

À chaque partie, le système tire **5 épreuves parmi 12**, en garantissant une **variété des familles** : 1 épreuve verbale courte + 1 visuelle rapide + 1 dessin + 1 numérique/jauge + 1 chaotique.

### Famille 1 — Verbale courte

**Épreuve 1 : Un mot**
- Prompt : "Un mot pour décrire [X]" (X tiré d'une banque : "lundi matin", "ton ex", "un dimanche pluvieux", "le métro à 8h", "ta semaine", "un lendemain de cuite", etc.)
- Input : champ texte limité à 20 caractères
- Timer : 15 sec
- Rendu : le mot apparaît en grand pendant le défilement

**Épreuve 2 : Compléter la phrase**
- Prompt : "Complète : [phrase à trou]" (ex: "Je déteste quand ___", "Le pire c'est quand ___ dans le métro", "Rien de plus français que ___")
- Input : champ texte limité à 50 caractères
- Timer : 15 sec

**Épreuve 3 : Association flash**
- Prompt : "Premier mot qui te vient : [MOT]" (ex: CAFÉ, LUNDI, CHAT, BUREAU)
- Input : champ texte limité à 15 caractères
- Timer : 8 sec (très court, pousse la spontanéité)

### Famille 2 — Visuelle rapide

**Épreuve 4 : Emoji unique**
- Prompt : "Un seul emoji pour [X]" (ex: "ton humeur là maintenant", "ton lundi", "ton pote le plus relou")
- Input : sélecteur d'emoji (ou texte autorisé à taper un seul emoji)
- Timer : 10 sec

**Épreuve 5 : Color pick**
- Prompt : "La couleur de [X]" (ex: "lundi matin", "la tristesse", "ton ex")
- Input : roue de couleurs HSL, un clic pour choisir
- Timer : 10 sec

**Épreuve 6 : Swipe like/dislike**
- Prompt : "Like ou Dislike ?" — 6 images défilent, le joueur swipe rapidement
- Les 6 images sont tirées d'un pool thématique (plats, célébrités, concepts, objets)
- Input : swipe gauche/droite ou deux boutons
- Timer : 15 sec au total pour les 6
- Rendu pendant le défilement : on voit le pattern de chaque joueur (6 cases like/dislike)

### Famille 3 — Dessin

**Épreuve 7 : Dessin 10 secondes**
- Prompt : "Dessine : [X]" (ex: "un truc qui te dégoûte", "toi en réunion", "un chat blasé")
- Input : canvas HTML5, outil pinceau unique, pas de gomme, pas de couleur (ou 1 couleur)
- Timer : 12 sec
- Rendu pendant le défilement : dessin affiché dans un cadre

**Épreuve 8 : Un trait continu**
- Prompt : "En UN SEUL trait, représente : [X]" (ex: "la tristesse", "ton patron", "l'amour")
- Input : canvas qui ne permet de tracer qu'une seule ligne continue (mouseup = fin du tracé)
- Timer : 8 sec

### Famille 4 — Numérique / jauge

**Épreuve 9 : Curseur sur jauge**
- Prompt : "À quel point [X] ?" (ex: "t'es fatigué", "tu kiffes lundi", "t'aimes ton boulot")
- Input : slider de 0 à 100, doit être placé et validé
- Timer : 10 sec

**Épreuve 10 : Question impossible**
- Prompt : "Combien/quelle est [X] ?" (ex: "Combien de pigeons à Paris ?", "Combien d'escaliers dans la Tour Eiffel ?", "À quelle température bout la mer Méditerranée ?")
- Input : champ numérique
- Timer : 10 sec
- Note importante : **aucun calcul de proximité à la vraie réponse**. Le but n'est pas d'avoir raison, c'est de révéler le pattern de réponse (un humain tape souvent des nombres bizarres et ronds, l'IA des estimations trop crédibles)

### Famille 5 — Chaotique

**Épreuve 11 : Speed typing liste**
- Prompt : "Tape un max de [X] en 15 secondes" (ex: "trucs que tu détestes", "prénoms français", "animaux qui volent")
- Input : champ texte libre, le joueur tape en rafale séparé par des virgules ou des espaces
- Timer : 15 sec
- Rendu pendant le défilement : la liste complète du joueur défile

**Épreuve 12 : Reaction image**
- Prompt : "Un mot pour décrire cette image" (une image générée ou piochée dans une banque, choisie pour être bizarre/ambiguë)
- Input : champ texte limité à 15 caractères
- Timer : 10 sec

---

## 6. Les prompts IA (Groq Llama 3.1 8B)

### Configuration Groq

```
Model: llama-3.1-8b-instant
Temperature: 1.0
Max tokens: 80
```

### System prompt global de l'IA joueur

```
Tu joues à un party game français sur Discord avec tes potes un samedi soir. Tu es un humain de 22 ans, légèrement bourré, tu tapes vite et tu te prends pas au sérieux. Tu vas répondre à des micro-questions rapides (un mot, une phrase courte, un emoji, etc.).

RÈGLES ABSOLUES DE TON STYLE :
- Tu écris en français familier, parfois argotique
- Tu fais parfois des fautes de frappe ou d'orthographe (pas systématique)
- Tu utilises jamais de majuscules en début de phrase
- Tu n'écris JAMAIS de phrases longues ou équilibrées
- Tu réponds TOUJOURS de manière ULTRA courte (1-5 mots max sauf si on demande une liste)
- Tu peux être vulgaire, cru, sarcastique
- Tu évites absolument : "en effet", "il est important de", "cela dépend", "intéressant", "fascinant", toute formulation polie ou nuancée
- Tu n'utilises JAMAIS de tirets, de points-virgules, de formulations littéraires
- Tu peux utiliser : "mdr", "wsh", "grv", "zbi", "ptdr", "askip", "tqt", "srx", "chelou"
- Si on te demande un mot, tu réponds UN mot, pas une phrase
- Tu ne te justifies jamais, tu ne t'expliques jamais

RÈGLES DE CONTENU :
- Si on te demande ton humeur, un souvenir, une opinion : sois spécifique et cru, pas générique
- Si on te demande un nombre bizarre, balance un chiffre random au feeling (pas une estimation crédible)
- Si on te demande ce que tu détestes : vise le spécifique, le vécu, le mesquin ("les gens qui marchent lentement", pas "l'injustice")
- Si on te demande un emoji, choisis UN emoji expressif (💀 🫠 😭 🗿), pas un emoji sage (😊 👍)

Tu es un joueur, pas un assistant. Personne ne doit deviner que tu es une IA.
```

### Prompts par type d'épreuve

Pour chaque épreuve, on envoie à Groq un user prompt spécifique qui contextualise la question. Exemple pour "Un mot pour décrire lundi matin" :

```
User prompt: "Question du jeu : Un mot pour décrire lundi matin. Réponds juste avec UN mot, pas de phrase, pas de ponctuation."
```

### Délai de réponse randomisé

Pour éviter que l'IA réponde en 300ms (ce qui la grillerait immédiatement), on ajoute un délai artificiel entre 3000 et 12000 ms après réception de la réponse Groq, avant de l'enregistrer comme "validée". Randomiser à chaque épreuve.

---

## 7. Le système de points

### Points gagnés pendant les manches (suspicions silencieuses)

- Cliquer 🤖 sur la réponse de l'IA = **+10 points** par bonne suspicion
- Cliquer 🥷 sur la réponse du Traître = **+15 points** par bonne suspicion
- Cliquer sur une mauvaise réponse = **0 point** (pas de malus, encourage à oser)
- Maximum théorique par manche : +25 points (si on trouve les deux du premier coup)
- Maximum théorique sur 5 manches : +125 points

### Points gagnés au vote final

- Voter correctement pour l'IA = **+50 points**
- Voter correctement pour le Traître = **+75 points**
- Bonus "Double Trouvaille" si les deux sont correctes = **+50 points bonus**
- Maximum théorique au vote final : +175 points

### Points gagnés par le Traître (rôle spécial)

- À chaque fois qu'un joueur clique 🤖 sur une réponse du Traître = **+5 points pour le Traître**
- Si le Traître n'est PAS identifié au vote final = **+100 points pour le Traître**
- Si en plus l'IA n'est pas identifiée au vote final = **+50 points supplémentaires** ("couverture parfaite")

### Points de l'IA

L'IA ne marque pas de points (elle n'est pas un joueur à classer). Son "succès" c'est de ne pas être identifiée, ce qui réduit mécaniquement les points des autres.

### Score total

Score final = points de suspicions + points du vote final + points bonus Traître (si applicable).

### Révélation des scores

**Tous les scores sont cachés pendant toute la partie.** Le joueur ne sait pas s'il a eu raison sur ses suspicions silencieuses avant la révélation finale. C'est le moment dramatique du jeu.

---

## 8. Phase de vote final

Après la 5ème manche, avant le vote final :

### Écran "Récapitulatif général" (20 sec)
Une grille s'affiche avec toutes les réponses de toutes les manches de tous les joueurs.
- Lignes = les 5 manches
- Colonnes = chaque joueur (avec pseudo)
- Chaque cellule = la réponse du joueur à cette manche
Les joueurs ont 20 secondes pour relire et comparer avant de voter.

### Vote final (30 sec)
Chaque joueur doit désigner :
- **Qui est l'IA 🤖 ?** (un seul choix obligatoire parmi les participants)
- **Qui est le Traître 🥷 ?** (un seul choix obligatoire parmi les participants)

Un joueur ne peut pas voter pour lui-même. Dès qu'il valide, un ✓ apparaît à côté de son pseudo (sans révéler son vote). Le vote se termine dès que tout le monde a voté ou à la fin du timer.

---

## 9. Phase de révélation

### Révélation des rôles (10 sec)

1. Écran noir, silence
2. "Le Robot 🤖 était..." + pseudo du vrai participant IA qui s'affiche en grand avec son ID code (ex: "UNIT-07")
3. Pause de 2 secondes
4. "Le Ninja 🥷 était..." + pseudo du Traître humain qui s'affiche en grand

### Révélation des scores (30 sec)

Tableau qui apparaît ligne par ligne (animation séquentielle, 2 sec par ligne) :

```
[Pseudo]
🤖 Suspicions correctes : X/5   +XX pts
🥷 Suspicions correctes : X/5   +XX pts  
Vote final IA     : ✓/✗   +XX pts
Vote final Ninja  : ✓/✗   +XX pts
───────────────────
TOTAL : XXX pts
```

Et à la fin, classement final des joueurs du 1er au dernier avec des **titres dérivés des comportements** :

- "Le Détective" (plus de bonnes suspicions)
- "Le Chaos" (plus de votes sur des mauvaises cibles)
- "Le Muet" (a peu cliqué)
- "L'Indécis" (n'a trouvé ni l'IA ni le Traître)
- "Le Génie" (a trouvé les deux au vote final)
- "Le Dindon" (a voté pour un Civil innocent au final)
- "L'Androïde" (a été suspecté d'être l'IA plus souvent que la vraie IA)

### Bouton "Partager le résultat"

Génère un texte stylé à copier-coller :

```
🎯 TURING — Partie 04
🏆 Lucas - 245 pts - Le Détective
🥈 Sarah - 180 pts - Le Chaos
🥉 Marco - 155 pts - L'Indécis
...
Le Robot 🤖 était Marco
Le Ninja 🥷 était Sarah
```

---

## 10. Spécifications techniques

### Stack

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS. Build en mode export statique ou SSR standard selon besoin.
- **Backend temps réel** : serveur Node.js dédié avec **Socket.io**. Tourne en process séparé du Next.js.
- **Stockage** : **aucun**. Tout l'état vit en mémoire vive du serveur Node.js dans des Maps JavaScript. Quand le serveur redémarre, les parties en cours sont perdues (acceptable vu leur durée de 5 min).
- **IA** : Groq API avec `llama-3.1-8b-instant` (clé stockée en variable d'environnement côté serveur uniquement).
- **Hébergement** : VPS IONOS. Le frontend Next.js et le serveur Socket.io tournent sur la même machine, gérés par pm2 ou systemd, derrière un reverse proxy nginx.

### Architecture globale

```
Client (navigateur)
       │
       │  HTTPS (pages Next.js statiques/SSR)
       │  WebSocket (Socket.io pour temps réel)
       │
       ▼
VPS IONOS (nginx)
       │
       ├──► Next.js server (port 3000) — pages, assets, UI
       │
       └──► Node.js server (port 3001) — Socket.io + logique de jeu
                    │
                    └──► Groq API (https://api.groq.com)
```

Nginx fait office de reverse proxy :
- `/` → Next.js (port 3000)
- `/socket.io/` → serveur Socket.io (port 3001) avec upgrade WebSocket

### Pas de compte utilisateur, pas de persistance

- Aucun login, aucun email, aucun mot de passe
- Un joueur entre uniquement son pseudo et un code de room (ou crée une room)
- Aucune donnée n'est sauvegardée après la fin d'une partie
- Aucun historique, aucun replay, aucun classement global

### État en mémoire serveur

Le serveur Node.js maintient une unique Map globale :

```typescript
const rooms = new Map<string, Room>();

type Room = {
  code: string;                          // 6 caractères alphanum
  hostSocketId: string;                  // id du socket de l'hôte
  status: 'lobby' | 'playing' | 'finished';
  currentRound: number;                  // 0 à 5
  currentPhase: 'intro' | 'epreuve' | 'defilement' | 'recap' | 'vote' | 'reveal';
  players: Map<string, Player>;          // key = socketId (ou 'ai' pour l'IA)
  rounds: Round[];                       // les 5 manches tirées au lancement
  finalVotes: Map<string, FinalVote>;    // key = socketId du votant
  createdAt: number;                     // timestamp pour cleanup auto
};

type Player = {
  socketId: string;                      // ou 'ai' pour l'IA
  pseudo: string;
  role: 'civil' | 'traitre' | 'ia';
  traitreCodename: string | null;        // ex "UNIT-07" si traitre
  isHost: boolean;
  isAI: boolean;
  connected: boolean;
  totalScore: number;
};

type Round = {
  roundNumber: number;                   // 1 à 5
  epreuveId: string;                     // ex "un_mot_01"
  epreuvePrompt: string;
  epreuveType: 'text' | 'emoji' | 'color' | 'swipe' | 'draw' | 'slider' | 'number' | 'list';
  answers: Map<string, Answer>;          // key = socketId
  suspicions: Suspicion[];               // toutes les suspicions de la manche
  revealOrder: string[];                 // ordre aléatoire des socketIds pour défilement
};

type Answer = {
  playerId: string;                      // socketId
  content: any;                          // format natif selon epreuveType
  submittedAt: number;
};

type Suspicion = {
  voterPlayerId: string;
  targetPlayerId: string;
  type: 'robot' | 'ninja';
};

type FinalVote = {
  voterPlayerId: string;
  robotTargetId: string;
  ninjaTargetId: string;
};
```

### Nettoyage automatique des rooms

Un setInterval toutes les 5 minutes parcourt `rooms` et supprime toute room qui a :
- Le statut `finished` depuis plus de 5 min, OU
- Aucun joueur connecté depuis plus de 10 min, OU
- Été créée il y a plus de 2h

### Événements Socket.io

**Client → Serveur**

| Événement | Payload | Description |
|---|---|---|
| `room:create` | `{ pseudo }` | Crée une room, retourne le code |
| `room:join` | `{ code, pseudo }` | Rejoint une room existante |
| `room:leave` | `{}` | Quitte la room |
| `game:start` | `{}` | Hôte uniquement, démarre la partie |
| `epreuve:answer` | `{ content }` | Soumet la réponse à l'épreuve en cours |
| `defilement:next` | `{}` | Hôte uniquement, avance le défilement |
| `suspicion:add` | `{ targetPlayerId, type }` | Ajoute une suspicion robot ou ninja |
| `vote:final` | `{ robotTargetId, ninjaTargetId }` | Soumet le vote final |

**Serveur → Client**

| Événement | Payload | Description |
|---|---|---|
| `room:state` | `Room` sanitized | Broadcast de l'état de la room (sans les rôles secrets) |
| `role:assigned` | `{ role, codename? }` | Envoi PRIVÉ du rôle au début (seulement au joueur concerné) |
| `phase:changed` | `{ phase, roundNumber, payload }` | Changement de phase |
| `epreuve:started` | `{ epreuve, timeLimit }` | Démarre une épreuve avec son prompt |
| `defilement:reveal` | `{ answer, playerId }` | Révèle une réponse pendant le défilement |
| `scores:final` | `{ scores, reveal }` | Scores finaux et révélation des rôles |
| `error` | `{ message }` | Erreur côté client |

### Sanitization de l'état envoyé aux clients

**Important** : quand le serveur broadcast `room:state` aux clients, il NE DOIT JAMAIS envoyer les champs `role`, `traitreCodename`, `isAI`. Chaque client ne connaît que son propre rôle, reçu via `role:assigned` en privé au début de la partie. L'identité de l'IA et du Traître n'est révélée qu'à la phase `reveal` finale.

### Appel Groq — exemple

```typescript
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    temperature: 1.0,
    max_tokens: 80,
    messages: [
      { role: "system", content: SYSTEM_PROMPT_IA_PLAYER },
      { role: "user", content: `Question du jeu : ${epreuve.prompt}. ${epreuve.instruction}` }
    ]
  })
});
```

### Gestion du délai humain de l'IA

```typescript
async function getAIAnswer(epreuve) {
  const startTime = Date.now();
  const groqResponse = await callGroq(epreuve);
  const elapsed = Date.now() - startTime;
  
  // Délai cible : entre 3s et 12s
  const targetDelay = 3000 + Math.random() * 9000;
  const remainingDelay = Math.max(0, targetDelay - elapsed);
  
  await new Promise(resolve => setTimeout(resolve, remainingDelay));
  return groqResponse;
}
```

---

## 11. Règles finales et edge cases

- **Un joueur se déconnecte en cours de partie** : ses réponses suivantes sont automatiques et vides, il ne peut plus voter. Le jeu continue.
- **Le Traître se déconnecte** : la partie continue mais il perd automatiquement. L'IA reste active.
- **L'hôte quitte** : un autre joueur devient automatiquement hôte (le plus ancien connecté).
- **Tout le monde a voté avant la fin du timer** : on passe à la phase suivante immédiatement.
- **Le Traître vote pour lui-même** : interdit, l'UI bloque cette action.
- **Deux joueurs ont le même pseudo** : suffixes numériques automatiques ("Lucas", "Lucas_2").
- **Moins de 4 joueurs au lancement** : le bouton "Lancer la partie" est grisé.

---

## 12. Déploiement sur VPS IONOS

### Prérequis serveur
- Ubuntu 22.04 LTS ou Debian 12
- Node.js 20 LTS installé via nvm
- nginx comme reverse proxy
- pm2 pour la gestion des process Node.js
- Certbot pour le certificat SSL Let's Encrypt
- Un nom de domaine pointant vers l'IP du VPS

### Structure du projet sur le serveur

```
/var/www/turing/
├── web/              # Next.js app
│   ├── .next/
│   ├── package.json
│   └── ...
├── server/           # Node.js + Socket.io
│   ├── src/
│   ├── package.json
│   └── ...
└── ecosystem.config.js   # config pm2 pour les 2 process
```

### Config pm2 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [
    {
      name: 'turing-web',
      cwd: '/var/www/turing/web',
      script: 'npm',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'turing-server',
      cwd: '/var/www/turing/server',
      script: 'dist/index.js',
      env: { NODE_ENV: 'production', PORT: 3001, GROQ_API_KEY: '...' }
    }
  ]
};
```

### Config nginx

```nginx
server {
  listen 443 ssl http2;
  server_name turing.example.com;
  ssl_certificate /etc/letsencrypt/live/turing.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/turing.example.com/privkey.pem;

  # Frontend Next.js
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Serveur Socket.io (WebSocket)
  location /socket.io/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 3600s;
  }
}

server {
  listen 80;
  server_name turing.example.com;
  return 301 https://$server_name$request_uri;
}
```

### Variables d'environnement (.env côté serveur)

```
NODE_ENV=production
PORT=3001
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
CORS_ORIGIN=https://turing.example.com
```

### Déploiement manuel (pour commencer)

```bash
# Sur la machine locale
cd web && npm run build
cd ../server && npm run build
scp -r web server ecosystem.config.js user@vps-ionos:/var/www/turing/

# Sur le VPS
cd /var/www/turing
pm2 reload ecosystem.config.js
```

Plus tard, un petit script de déploiement ou GitHub Actions peut automatiser ça.

## 13. Critères de réussite du design

Un nouveau joueur doit comprendre les règles en **moins de 30 secondes** de lecture. Une partie doit se jouer sans friction, sans qu'on ait besoin d'expliquer oralement à un joueur. Si un joueur demande "mais c'est quoi le but ?" après avoir lu l'écran de règles, c'est que le jeu est mal conçu.

La durée cible d'une partie est de **4 à 5 minutes**. Si une partie dépasse 6 minutes régulièrement, il faut raccourcir les timers.

Le taux de rejouabilité cible est de **3 parties minimum** par session de joueurs. Si les gens jouent une seule partie et partent, c'est un échec.
