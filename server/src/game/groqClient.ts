import { Epreuve } from '../types';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_TIMEOUT_MS = 15000;

// ─── System prompt (verbatim from rules.md §6) ────────────────────────────────

const SYSTEM_PROMPT = `Tu joues à un party game français sur Discord avec tes potes un samedi soir. Tu es un humain de 22 ans, légèrement bourré, tu tapes vite et tu te prends pas au sérieux. Tu vas répondre à des micro-questions rapides (un mot, une phrase courte, un emoji, etc.).

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

CONTRAINTES STYLISTIQUES STRICTES :
- Liste : MAXIMUM 5 items, chacun de 1 à 2 mots, SÉPARÉS PAR DES VIRGULES SANS ESPACE
- Fais 1 faute de frappe volontaire dans au moins 30% de tes réponses (lettres manquantes, accents oubliés, majuscules random)
- Utilise les abréviations SMS : bcp, pk, tkt, psk, jsp, bsr, dsl
- Jamais plus de 5 mots sauf pour les listes
- Zéro ponctuation finale, pas de point à la fin
- Si tu hésites entre deux formulations, prends la plus courte et la plus moche`;

// ─── User prompt instructions per inputType ──────────────────────────────────

const INPUT_INSTRUCTIONS: Record<string, string> = {
  text:   'Réponds avec UN seul mot (10 caractères max). Pas de phrase, pas de ponctuation, pas de majuscule.',
  emoji:  'Réponds avec UN SEUL emoji, rien d\'autre. Juste l\'emoji.',
  color:  'Réponds avec un code couleur hexadécimal exactement (exemple : #FF3300). Rien d\'autre.',
  swipe:  'Tu vas voir 6 trucs. Réponds avec exactement 6 lettres L ou D séparées par des espaces (L=Like, D=Dislike). Exemple : L D D L D L',
  draw:   'Réponds avec UN SEUL MOT qui décrit ce que tu griffonnerais en 10 secondes. Juste le mot.',
  slider: 'Réponds avec UN nombre entier de 0 à 100. Juste le chiffre.',
  number: 'Réponds avec UN nombre entier. Juste le chiffre, balance un truc au feeling.',
  list:   'Donne 5 à 8 items ultra courts (1-3 mots chacun), séparés par des virgules.',
};

function buildUserPrompt(epreuve: Epreuve): string {
  const instruction = INPUT_INSTRUCTIONS[epreuve.inputType] ?? INPUT_INSTRUCTIONS.text;
  return `Question du jeu : ${epreuve.basePrompt}. ${instruction}`;
}

// ─── API types ────────────────────────────────────────────────────────────────

export type GroqResult = {
  content: string;
  promptTokens: number;
  completionTokens: number;
};

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * Calls the Groq API with the system prompt + a prompt adapted to the épreuve.
 * Throws on HTTP error, timeout, or empty/malformed response.
 * Never logs or exposes the API key.
 */
export async function callGroq(epreuve: Epreuve): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 1.0,
        max_tokens: 80,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(epreuve) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq HTTP ${response.status}`);
    }

    const data = (await response.json()) as any;
    const content: string = data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Groq returned empty content');

    return {
      content,
      promptTokens: data?.usage?.prompt_tokens ?? 0,
      completionTokens: data?.usage?.completion_tokens ?? 0,
    };
  } finally {
    clearTimeout(timeout);
  }
}
