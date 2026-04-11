export const CODENAMES: string[] = [
  // Dragon Ball
  'GOKU', 'VEGETA', 'PICCOLO', 'PETIT-COEUR', 'GOHAN', 'TRUNKS', 'FRIEZA', 'CELL',
  // Naruto
  'KAKASHI', 'ITACHI', 'MADARA', 'NARUTO',
  // One Piece
  'LUFFY', 'ZORO', 'SHANKS', 'ACE',
  // JoJo / Fist of the North Star
  'JOTARO', 'DIO', 'KENSHIRO',
  // Metal Gear
  'SNAKE', 'BIG-BOSS', 'OCELOT', 'PSYCHO-MANTIS', 'RADIOMAN',
  // Street Fighter / gaming
  'RYU', 'AKUMA', 'LINK', 'GANON', 'PIKACHU', 'MEWTWO',
  // Sonic
  'SONIC', 'SHADOW', 'TAILS', 'KNUCKLES',
  // Yu-Gi-Oh
  'EXODIA', 'KAIBA', 'MARIK',
  // Baki
  'BAKI', 'CROC', 'RETSU', 'SHIZUMA', 'JUPITER',
  // Anime
  'ONIZUKA', 'SPIKE', 'EDWARD', 'FAYE', 'ALUCARD', 'VASH', 'LAIN', 'TETSUO', 'KANEDA',
  // Mythologie / divers
  'IZANAMI', 'EPONA', 'MOWGLI',
  // French
  'LUCKY', 'KATA', 'GOLDEN', 'BOBO', 'ZORG',
];

/** Fisher-Yates shuffle — returns a NEW array, does not mutate */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks two distinct codenames from the pool.
 * Returns [codenameForIA, codenameForTraitre].
 */
export function pickTwoCodenames(): [string, string] {
  const shuffled = shuffle(CODENAMES);
  return [shuffled[0], shuffled[1]];
}
