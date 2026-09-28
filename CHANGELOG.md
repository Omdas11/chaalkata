# Chaal-Kaata changelog

## 2026-09-28 — Originality & game-UX overhaul (Lau Kata Kati)

A full review pass over the Next.js rebuild, implementing a design and
gameplay brief for originality, rules correctness, UX, accessibility,
content, and hygiene.

### Originality
- Replaced the notebook-paper/tape look with an original village-soil
  visual system: packed-earth surfaces, turmeric accent, clay buttons,
  gamosa-red details, chalk text.
- Self-hosted fonts via Fontsource (Yatra One, Kalam, Hind, Hind Siliguri);
  no Google CDN at runtime.
- Original inline SVG icon set; no emoji icons, no third-party icon packs.
- New `EarthPanel`, `GamosaStrip`, `Footer` components; `PaperPanel` removed.

### Rules & AI
- Threefold-repetition draws tracked per game (`positionCounts`,
  `positionKey`); old saves are normalised on resume.
- AI difficulties: Easy (random legal), Medium (greedy max-capture),
  Hard (depth-3 negamax, alpha-beta, 40k-node cap) — all obey compulsory
  capture.
- `tests/engine.test.ts`: opening position, compulsory capture, AI
  capture obedience, threefold draw, no false draws.

### Game UX
- Capture-capable stones get turmeric hint rings; last move gets a landing
  ring and capture markers; refused moves show a notice and play a thud.
- Clear turn banner (flips for the far side in 2-player), animated capture
  counters, move list, AI "thinking" indicator.
- Undo (full turn in vs-AI mode), game-over dialog with replay/home,
  sound off by default with persistent toggle, haptics where supported.

### Accessibility
- Keyboard/screen-reader board: hidden until focused, arrow-key
  navigation, labelled points, `aria-live` announcements for selection,
  refused moves, captures, AI moves, and game end.
- Shape-coded stones (rough dark / smooth pale), 44px touch targets,
  reduced-motion respected throughout.

### Content
- Illustrated How to Play (five steps, original SVG diagrams), history
  blurb with sources (Wikipedia, Ludii, bead.game, whatdowedoallday),
  Bengali labels throughout, family links to the seven upcoming games.

### Hygiene
- Expanded metadata + OG card, PWA manifest with generated icons,
  custom 404, no third-party runtime assets, unused boilerplate removed.

## 2026-09-28 — Next.js rebuild replaces Vite site
- Rebuilt from scratch in Next.js (App Router), one game at a time,
  starting with Lau Kata Kati. Old Vite site preserved on branch
  `old-vite-site`; rebuild pushed to `main`.
- Commit `291acd7`: Board3D camera flipped so the human's dark stones sit
  on the near edge; WebAudio synth sounds (select/move/capture/win);
  generated 30s nature ambience loop (`public/sounds/ambience.{ogg,mp3}`);
  shared `ck-muted` localStorage key.
- Supabase backend decided: Auth (magic link), per-account saved games,
  results, public leaderboard. Schema v2 in `supabase/schema.sql`
  (NOT yet run — tables don't exist in the project).
