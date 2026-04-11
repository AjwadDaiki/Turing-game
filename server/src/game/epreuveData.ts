import { Epreuve } from '../types';

export const EPREUVES: Epreuve[] = [
  // ─── Famille 1 : Verbale courte ───────────────────────────────────────────
  {
    id: 'un_mot',
    family: 'verbale',
    inputType: 'text',
    basePrompt: 'Un mot pour décrire [X]',
    promptBanque: ['lundi matin', 'ton ex', 'un dimanche pluvieux', 'le métro à 8h', 'ta semaine', 'un lendemain de cuite'],
    timeLimit: 15,
  },
  {
    id: 'completer_phrase',
    family: 'verbale',
    inputType: 'text',
    basePrompt: 'Complète : [X]',
    promptBanque: [
      "Je déteste quand ___",
      "Le pire c'est quand ___ dans le métro",
      "Rien de plus français que ___",
      "Mon boss ressemble à ___",
      "La vie serait meilleure sans ___",
    ],
    timeLimit: 15,
  },
  {
    id: 'association_flash',
    family: 'verbale',
    inputType: 'text',
    basePrompt: 'Premier mot qui te vient : [X]',
    promptBanque: ['CAFÉ', 'LUNDI', 'CHAT', 'BUREAU', 'PLUIE', 'ARGENT', 'NUIT', 'VIDE'],
    timeLimit: 8,
  },

  // ─── Famille 2 : Visuelle rapide ──────────────────────────────────────────
  {
    id: 'emoji_unique',
    family: 'visuelle',
    inputType: 'emoji',
    basePrompt: 'Un seul emoji pour [X]',
    promptBanque: ['ton humeur là maintenant', 'ton lundi', 'ton pote le plus relou', 'ta vie', 'ton chef'],
    timeLimit: 10,
  },
  {
    id: 'color_pick',
    family: 'visuelle',
    inputType: 'color',
    basePrompt: 'La couleur de [X]',
    promptBanque: ['lundi matin', 'la tristesse', 'ton ex', "l'espoir", 'la fatigue'],
    timeLimit: 10,
  },
  {
    id: 'swipe_like',
    family: 'visuelle',
    inputType: 'swipe',
    basePrompt: 'Like ou Dislike ?',
    promptBanque: ['Like ou Dislike ?'],
    timeLimit: 15,
  },

  // ─── Famille 3 : Dessin ───────────────────────────────────────────────────
  {
    id: 'dessin_10s',
    family: 'dessin',
    inputType: 'draw',
    basePrompt: 'Dessine : [X]',
    promptBanque: ['un truc qui te dégoûte', 'toi en réunion', 'un chat blasé', 'ton patron', 'la joie'],
    timeLimit: 12,
  },
  {
    id: 'un_trait',
    family: 'dessin',
    inputType: 'draw',
    basePrompt: 'En UN SEUL trait, représente : [X]',
    promptBanque: ['la tristesse', 'ton patron', "l'amour", 'le chaos', 'un vendredi soir'],
    timeLimit: 8,
  },

  // ─── Famille 4 : Numérique / jauge ───────────────────────────────────────
  {
    id: 'curseur_jauge',
    family: 'numerique',
    inputType: 'slider',
    basePrompt: 'À quel point [X] ?',
    promptBanque: ["t'es fatigué", 'tu kiffes lundi', "t'aimes ton boulot", 'tu te sens productif', "t'as envie de rien"],
    timeLimit: 10,
  },
  {
    id: 'question_impossible',
    family: 'numerique',
    inputType: 'number',
    basePrompt: 'Combien [X] ?',
    promptBanque: [
      'de pigeons à Paris',
      "d'escaliers dans la Tour Eiffel",
      'de fois tu ouvres ton frigo sans raison par semaine',
      'de secondes dans une heure',
      'de baguettes vendues en France par jour',
    ],
    timeLimit: 10,
  },

  // ─── Famille 5 : Chaotique ────────────────────────────────────────────────
  {
    id: 'speed_typing',
    family: 'chaotique',
    inputType: 'list',
    basePrompt: 'Tape un max de [X] en 15 secondes',
    promptBanque: ['trucs que tu détestes', 'prénoms français', 'animaux qui volent', 'excuses bidon au boulot', "trucs que t'aurais pas dû manger"],
    timeLimit: 15,
  },
  {
    id: 'reaction_image',
    family: 'chaotique',
    inputType: 'text',
    basePrompt: 'Un mot pour décrire cette image',
    promptBanque: ['Un mot pour décrire cette image'],
    timeLimit: 10,
  },
];
