export interface GameMeta {
  title: string;
  subtitle: string;
  history: string;
  rules: string;
  caveat: string;
}

export const GAME_META: Record<string, GameMeta> = {
  'lau-kata-kati': {
    title: 'Lau Kata Kati',
    subtitle: 'Kowwu Dunki · Lower Bengal · 9 pieces',
    history:
      'The butterfly-board classic of Lower Bengal — two triangles sharing one apex. Each side fills its own triangle; the shared apex starts empty. Captures are compulsory and chain from landing to landing.',
    rules:
      'Move to an adjacent point along a drawn line, or jump-capture an adjacent enemy onto the empty point beyond. Captures are compulsory, chained captures too. Blocked player loses; if neither side can capture, more pieces wins.',
    caveat: 'Side A moves first here — the sources say players simply agree who starts.',
  },
  pretwa: {
    title: 'Pretwa',
    subtitle: 'Bihar · 9 pieces',
    history:
      "Three concentric circles cut by three diameters — 19 points including the centre. Each side lines up along three consecutive spokes. Sources: Murray (1952, p.71), Mats Winther's Indian War-games diagrams. No digital version exists.",
    rules:
      'Captures compulsory; each capture runs along one circle or diameter, but consecutive captures in one turn may switch. We implement capture-all as the win.',
    caveat:
      'Win condition is disputed: most sources accept capture-all or reducing the enemy to three; one source says capture-all only.',
  },
  'dash-guti': {
    title: 'Dash-Guti',
    subtitle: 'Central Provinces · 10 pieces',
    history:
      "Lau Kata Kati's butterfly board plus a short 'antenna' stub at the shared vertex — each side's 10th piece starts on its antenna endpoint. Murray (1952, p.70) via secondary sources. No digital version.",
    rules:
      'Standard Alquerque movement and compulsory jump-captures. Win by capturing all enemy pieces; stalemate loses; if captures dry up, more pieces wins.',
    caveat:
      "Murray's original text wasn't directly consulted; the antenna wording rests on secondary sources.",
  },
  'terhuchu-v1': {
    title: 'Terhüchü',
    subtitle: 'standard form · Angami Naga, Nagaland · 10 pieces',
    history:
      'The usual form of the Angami Naga game terhüchü: a standard 5×5 Alquerque board, ten pieces a side on the two back ranks. J.H. Hutton, The Angami Nagas (1921), pp.101–102; Ludii Evidence 1681. No digital version exists.',
    rules:
      'Standard Alquerque movement with compulsory jump-captures. Capture all enemy pieces or leave them with no legal move.',
    caveat: "'v1' is our label — Hutton doesn't number the forms. Side A moves first is our convention.",
  },
  'egara-guti': {
    title: 'Egara-Guti',
    subtitle: 'Central Provinces · 11 pieces',
    history:
      "The name means 'eleven pieces'. Two extra full lines run through the Lau Kata Kati triangles, growing the board to 23 points. Murray (1952, p.71); J.M. Datta (1939). No digital version.",
    rules:
      'Standard movement, compulsory chained captures. Win by capture-all; stalemate loses; piece-majority decides a capture drought.',
    caveat:
      "The exact routing of the extra lines is inferred from Winther's diagram — Murray's original wasn't seen.",
  },
  'terhuchu-v3': {
    title: 'Terhüchü',
    subtitle: 'triangular-refuge variant · Angami Naga, Nagaland · 9 pieces',
    history:
      "Hutton's 'variant form': the Alquerque board grown eight triangular refuges — 73 points in all. Hutton (1921) Fig. II; Ludii Evidence 833. No digital version exists.",
    rules:
      'Standard Alquerque movement with compulsory captures across the whole 73-point board. Nine pieces a side.',
    caveat:
      'Hutton says a piece inside a refuge may \'skip one junction\' — whether that\'s optional or required is ambiguous, so we don\'t encode it; noted here instead.',
  },
  'sumi-naga-war-game': {
    title: 'Sümi Naga War Game',
    subtitle: 'Sümi Naga, Nagaland · 11 pieces · name unknown',
    history:
      "Hutton (The Sema Nagas, 1921, p.111) records this game without giving it a name — 'a second game known as the war game'. Eleven pieces a side on a standard Alquerque board; the eleventh men take the outside places of the middle line. No digital version exists anywhere.",
    rules:
      'Move along the lines one point at a time; capture by jumping as in draughts. Traditional scoring is most-captures — we end the game when a side is wiped out or blocked, and the side with more captures wins.',
    caveat:
      "Hutton's diagram and Ludii disagree on the 11th man's placement; we follow Hutton's diagram. The title is our placeholder — credit to Hutton's 1921 documentation.",
  },
  'sixteen-soldiers': {
    title: 'Sixteen Soldiers',
    subtitle: 'Sholo Guti · Sri Lanka & pan-India · 16 pieces — the boss',
    history:
      'The family\'s heavyweight: an Alquerque board flanked by two triangles, 37 points, sixteen pieces a side. Rules per H. Parker (Ancient Ceylon, 1909) via Wikipedia. Crude apps exist, but none with sourced rules.',
    rules:
      'Move and capture in any direction along drawn lines. NOTE: unlike every other game here, captures are NOT compulsory — but you may chain them. Capture all enemy pieces to win.',
    caveat: 'Triangle wiring is medium-confidence, transcribed from a single physical-board photo.',
  },
};

/** Family-tree tiers: [tier label, list of board ids] */
export const TREE_TIERS: { label: string; ids: string[] }[] = [
  { label: '9 pieces', ids: ['lau-kata-kati', 'pretwa', 'terhuchu-v3'] },
  { label: '10 pieces', ids: ['dash-guti', 'terhuchu-v1'] },
  { label: '11 pieces', ids: ['egara-guti', 'sumi-naga-war-game'] },
  { label: '16 pieces — the boss', ids: ['sixteen-soldiers'] },
];

export const LANDING_COPY = {
  tagline: 'चाल-काटा · move and cut',
  intro:
    'Alquerque — qirkat — is the Middle Eastern ancestor of draughts: pieces on intersection points, capturing by jumping. H.J.R. Murray documented 40+ regional variants worldwide, and some of the most obscure live in India and Nagaland — recorded in 1920s ethnographies and never given a digital version. Until now. Climb the family tree: start with the little 9-piece folk games and work up to the 16-piece boss.',
  footer:
    'Board geometries from 1920s ethnographies (Hutton, Parker), Murray (1952), and diagrams by Mats Winther; no digital versions existed before this one. Play locally in your browser — nothing leaves your device.',
};
