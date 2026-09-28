"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "bn";

const LANG_KEY = "ck-lang";

const en = {
  langName: "English",
  langToggle: "বাংলা",
  langLabel: "Language",
  home: {
    eyebrow: "Chaal-Kaata",
    titleA: "Move ",
    titleEm: "and",
    titleB: " cut.",
    tagline:
      "A playable collection of lesser-known Indian board games in the Alquerque family — first scratched into village soil, now dug into this page.",
    play: "Play Lau Kata Kati",
    meta: "9 pieces a side · Lower Bengal · captures compulsory",
    benchEyebrow: "On the bench",
    benchTitle: "More games, coming soon",
    soon: "soon",
    carouselEyebrow: "The shelf",
    carouselTitle: "Choose your game",
    footer: "Chaal-Kaata · traditional games, digitised with care",
    signInPrompt: "Sign in to save games and join the leaderboard.",
  },
  games: {
    pretwa: { name: "Pretwa", note: "the ring fighter", blurb: "the ring fighter" },
    dashGuti: { name: "Dash-Guti", note: "ten aside", blurb: "ten aside" },
    egaraGuti: { name: "Egara-Guti", note: "eleven aside", blurb: "eleven aside" },
    terhuchu1: { name: "Terhüchü v1", note: "Naga hills", blurb: "Naga hills chase" },
    terhuchu3: { name: "Terhüchü v3", note: "Naga hills", blurb: "Naga hills leap" },
    sumi: { name: "Sümi Naga war game", note: "unnamed no more, soon", blurb: "battle lines drawn" },
    sixteen: { name: "Sixteen Soldiers", note: "sixteen aside", blurb: "sixteen strong" },
  },
  menu: {
    menu: "Menu",
    open: "Open menu",
    close: "Close menu",
    nav: "Explore",
    controls: "Game controls",
    home: "Home",
    play: "Play Lau Kata Kati",
    howToPlay: "How to play",
    history: "History",
    language: "Language",
    source: "Source code",
  },
  game: {
    back: "all games",
    title: "Lau Kata Kati",
    rules: "Two triangles share one tip. Nine stones a side; the middle stays empty. Walk along the drawn lines. Cut with a short jump — and cuts are compulsory: keep chaining while you can. No moves left and you lose; otherwise the side with more stones standing wins.",
    twoPlayers: "2 players",
    vsAi: "vs AI",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    restart: "Restart",
    undo: "Undo",
    soundOn: "Sound",
    soundOff: "Muted",
    mute: "Mute sounds",
    unmute: "Unmute sounds",
    resume: "Resume saved game",
    wins: (name: string) => `${name} wins`,
    moveN: (n: number) => `move ${n}`,
    capturedBy: (side: string) => `Captured by ${side}`,
    dark: "dark",
    pale: "pale",
    moves: "Moves",
    turnYou: (name: string) => `${name} to move`,
    turnThinking: "AI is thinking…",
    noticeCapture: "Captures are compulsory — take the leap.",
    noticeInvalid: "That step isn't allowed.",
    noticeMustCapture: "You must capture — only the marked stones can move.",
    gameOver: "Game over",
    draw: "Draw",
    playAgain: "Play again",
    allGames: "All games",
    standing: (a: number, b: number) => `Stones standing — dark ${a}, pale ${b}`,
    youDark: "You (dark)",
    aiPale: "AI (pale)",
    sideADark: "Side A (dark)",
    sideBPale: "Side B (pale)",
    keyboardHelp:
      "Keyboard board: arrow keys move between the 19 points, Enter selects a stone or moves to a marked point.",
    pointLabel: (n: number, stone: string) => `Point ${n}, ${stone}`,
    pointDark: "dark stone",
    pointPale: "pale stone",
    pointEmpty: "empty point",
    pointSelected: ", selected",
    pointCanMove: ", can move",
    announceMove: (side: string, from: string, to: string) => `${side} moved from point ${from} to point ${to}.`,
    announceCaptured: (count: number) => `Capturing ${count}.`,
    announceTurn: (name: string) => `${name} to move.`,
    announceAi: (diff: string) => `AI (${diff}) is thinking.`,
    announceGameOver: (text: string) => `Game over. ${text}`,
    announceUndone: "Move undone.",
    announceRestarted: "New game started.",
    announceResumed: "Saved game resumed.",
    signInToSave: "Sign in to save this game.",
    saved: "Saved.",
    region: "Lower Bengal (also played as Kowwu Dunki)",
  },
  howto: {
    eyebrow: "How to play",
    title: "Five steps to your first cut",
    steps: [
      { title: "Set the board", text: "Each side takes a triangle and places nine stones on its points. The shared tip in the middle stays empty." },
      { title: "Walk a stone", text: "On your turn, slide one stone one step along a drawn line to a neighbouring empty point." },
      { title: "Cut by jumping", text: "Hop over an adjacent enemy stone onto the empty point just behind it. The jumped stone is cut and leaves the board." },
      { title: "Cuts are compulsory", text: "If any stone can cut, you must cut — and keep chaining jumps in the same turn while you can." },
      { title: "Win standing", text: "Cut every enemy stone, or leave the other side with no legal move. Otherwise the side with more stones standing wins." },
    ],
  },
  history: {
    eyebrow: "Roots",
    title: "Where this game comes from",
    p1: "Lau Kata Kati is a two-player war game from Lower Bengal, in the Alquerque family — the same old family as draughts and Fanorona. Villagers scratched its two triangles into courtyard soil and played it with seeds, pebbles, or cowries.",
    p2: "It travels under other names too: Kowwu Dunki in some districts, and cousins of it are played across South and Southeast Asia under the Lau Kata Kati rules of compulsory capture.",
    sources: "Sources:",
  },
  family: {
    eyebrow: "The family",
    title: "More cousins, coming soon",
    text: "Lau Kata Kati is the first leaf on this branch. Pretwa, Dash-Guti, Egara-Guti, the Naga hill games and more are being rebuilt one by one.",
    seeAll: "See all upcoming games",
  },
  reasons: {
    capturedAll: (side: string) => `${side} captured all enemy pieces`,
    noMoves: (side: string) => `${side} has no legal moves`,
    threefold: "Draw — the same position occurred three times",
    sixtyWin: (side: string, pa: number, pb: number) => `60 moves without a capture — more pieces wins (${side}, ${pa} vs ${pb})`,
    sixtyDraw: (pa: number) => `Draw — 60 moves without a capture, equal pieces (${pa})`,
    sideA: "Side A",
    sideB: "Side B",
  },
  auth: {
    signIn: "Sign in",
    signOut: "Sign out",
    emailPlaceholder: "you@example.com",
    sendLink: "Send magic link",
    checkEmail: "Check your email for the magic link.",
    signedInAs: (email: string) => `Signed in as ${email}`,
  },
  footer: {
    tagline: "Chaal-Kaata — traditional games, dug up with care.",
    source: "Source on GitHub",
    disclaimer: "Original design. Inspired by traditional games; not affiliated with any other site.",
  },
  leaderboard: {
    title: "Hall of fame",
    player: "player",
    win: "win",
    wins: "wins",
    vsAi: "vs AI",
    games: "games",
    top: "top",
  },
  notFound: {
    title: "This path isn't on the board",
    text: "The point you're looking for doesn't exist.",
    home: "Back to the board",
  },
};

export type Dict = typeof en;

const bn: Dict = {
  langName: "বাংলা",
  langToggle: "English",
  langLabel: "ভাষা",
  home: {
    eyebrow: "চাল-কাটা",
    titleA: "চাল দাও ",
    titleEm: "আর",
    titleB: " কাটো।",
    tagline:
      "আলকার্ক পরিবারের স্বল্পপরিচিত ভারতীয় বোর্ড খেলার খেলার মতো সংগ্রহ — একসময় গ্রামের মাটিতে আঁকা হতো, এখন এই পাতায় খোদাই।",
    play: "লাউ কাটা কাটি খেলো",
    meta: "প্রতি পক্ষে ৯ ঘুঁটি · নিম্নবঙ্গ · কাটা বাধ্যতামূলক",
    benchEyebrow: "বেঞ্চে",
    benchTitle: "আরও খেলা আসছে",
    soon: "শীঘ্রই",
    carouselEyebrow: "তাক",
    carouselTitle: "খেলা বেছে নিন",
    footer: "চাল-কাটা · ঐতিহ্যবাহী খেলা, যত্নে ডিজিটাল",
    signInPrompt: "খেলা সেভ করতে ও লিডারবোর্ডে যোগ দিতে সাইন ইন করো।",
  },
  games: {
    pretwa: { name: "প্রেত্বা", note: "রিং যোদ্ধা", blurb: "the ring fighter" },
    dashGuti: { name: "দশ-গুটি", note: "প্রতি পক্ষে দশ", blurb: "ten aside" },
    egaraGuti: { name: "এগারো-গুটি", note: "প্রতি পক্ষে এগারো", blurb: "eleven aside" },
    terhuchu1: { name: "তেরহুচু ১", note: "নাগা পাহাড়", blurb: "Naga hills chase" },
    terhuchu3: { name: "তেরহুচু ৩", note: "নাগা পাহাড়", blurb: "Naga hills leap" },
    sumi: { name: "সুমি নাগা যুদ্ধখেলা", note: "নামহীন আর নয়, শীঘ্রই", blurb: "battle lines drawn" },
    sixteen: { name: "ষোলো সৈনিক", note: "প্রতি পক্ষে ষোলো", blurb: "sixteen strong" },
  },
  menu: {
    menu: "মেনু",
    open: "মেনু খুলুন",
    close: "বন্ধ করুন",
    nav: "ঘুরে দেখুন",
    controls: "খেলার বোতাম",
    home: "হোম",
    play: "লাউ কাটা কাটি খেলুন",
    howToPlay: "কীভাবে খেলবেন",
    history: "ইতিহাস",
    language: "ভাষা",
    source: "সোর্স কোড",
  },
  game: {
    back: "সব খেলা",
    title: "লাউ কাটা কাটি",
    rules: "দুটি ত্রিভুজ একটি শীর্ষবিন্দু ভাগ করে। প্রতি পক্ষে নয়টি ঘুঁটি; মাঝখানটা খালি থাকে। আঁকা রেখা ধরে এগোও। ছোট লাফে কাটো — আর কাটা বাধ্যতামূলক: যতক্ষণ পারো একই চালে লাফের শৃঙ্খল ধরে রাখো। চাল না থাকলে হার; নইলে যার বেশি ঘুঁটি দাঁড়িয়ে, সেই জেতে।",
    twoPlayers: "দুজন",
    vsAi: "এআই-এর বিরুদ্ধে",
    difficulty: "কাঠিন্য",
    easy: "সহজ",
    medium: "মাঝারি",
    hard: "কঠিন",
    restart: "আবার",
    undo: "ফেরত",
    soundOn: "শব্দ",
    soundOff: "নিঃশব্দ",
    mute: "শব্দ বন্ধ করো",
    unmute: "শব্দ চালু করো",
    resume: "সেভ খেলা চালিয়ে যাও",
    wins: (name: string) => `${name} জিতল`,
    moveN: (n: number) => `${n} নম্বর চাল`,
    capturedBy: (side: string) => `${side} যা কেটেছে`,
    dark: "কালো",
    pale: "সাদা",
    moves: "চালসমূহ",
    turnYou: (name: string) => `${name}-এর চাল`,
    turnThinking: "এআই ভাবছে…",
    noticeCapture: "কাটা বাধ্যতামূলক — লাফ দাও।",
    noticeInvalid: "এই চাল চলবে না।",
    noticeMustCapture: "তোমাকে কাটতেই হবে — শুধু চিহ্নিত ঘুঁটিগুলো চলতে পারে।",
    gameOver: "খেলা শেষ",
    draw: "ড্র",
    playAgain: "আবার খেলো",
    allGames: "সব খেলা",
    standing: (a: number, b: number) => `দাঁড়িয়ে থাকা ঘুঁটি — কালো ${a}, সাদা ${b}`,
    youDark: "তুমি (কালো)",
    aiPale: "এআই (সাদা)",
    sideADark: "ক পক্ষ (কালো)",
    sideBPale: "খ পক্ষ (পালো)",
    keyboardHelp: "কিবোর্ড বোর্ড: তীর চিহ্নে ১৯টি বিন্দুর মধ্যে ঘোরো, এন্টারে ঘুঁটি বাছো বা চিহ্নিত বিন্দুতে চাল দাও।",
    pointLabel: (n: number, stone: string) => `বিন্দু ${n}, ${stone}`,
    pointDark: "কালো ঘুঁটি",
    pointPale: "সাদা ঘুঁটি",
    pointEmpty: "খালি বিন্দু",
    pointSelected: ", বাছা",
    pointCanMove: ", চলতে পারে",
    announceMove: (side: string, from: string, to: string) => `${side} ${from} থেকে ${to} বিন্দুতে চাল দিল।`,
    announceCaptured: (count: number) => `${count}টি কেটে।`,
    announceTurn: (name: string) => `${name}-এর চাল।`,
    announceAi: (diff: string) => `এআই (${diff}) ভাবছে।`,
    announceGameOver: (text: string) => `খেলা শেষ। ${text}`,
    announceUndone: "চাল ফেরত নেওয়া হলো।",
    announceRestarted: "নতুন খেলা শুরু।",
    announceResumed: "সেভ খেলা চালু হলো।",
    signInToSave: "এই খেলা সেভ করতে সাইন ইন করো।",
    saved: "সেভ হয়েছে।",
    region: "নিম্নবঙ্গ (কাউউ ডাংকি নামেও খেলা হয়)",
  },
  howto: {
    eyebrow: "কীভাবে খেলবেন",
    title: "প্রথম কাটার পাঁচ ধাপ",
    steps: [
      { title: "বোর্ড সাজাও", text: "প্রত্যেক পক্ষ একটি ত্রিভুজ নিয়ে নয়টি ঘুঁটি তার বিন্দুতে বসায়। মাঝের ভাগ করা শীর্ষবিন্দু খালি থাকে।" },
      { title: "ঘুঁটি হাঁটাও", text: "তোমার চালে একটি ঘুঁটি আঁকা রেখা ধরে পাশের খালি বিন্দুতে এক ধাপ এগোও।" },
      { title: "লাফে কাটো", text: "পাশের শত্রু ঘুঁটির ওপর দিয়ে ঠিক পেছনের খালি বিন্দুতে লাফ দাও। লাফানো ঘুঁটি কাটা পড়ে বোর্ড ছাড়ে।" },
      { title: "কাটা বাধ্যতামূলক", text: "কোনো ঘুঁটি কাটতে পারলে কাটতেই হবে — আর যতক্ষণ পারো একই চালে লাফের শৃঙ্খল চালিয়ে যাও।" },
      { title: "দাঁড়িয়ে জেতো", text: "শত্রুর সব ঘুঁটি কাটো, বা প্রতিপক্ষের বৈধ চাল শেষ করো। নইলে যার বেশি ঘুঁটি দাঁড়িয়ে, সেই জেতে।" },
    ],
  },
  history: {
    eyebrow: "ইতিহাস",
    title: "এই খেলা কোথা থেকে এল",
    p1: "লাউ কাটা কাটি নিম্নবঙ্গের দুজনের যুদ্ধখেলা, আলকার্ক পরিবারের — ড্রাফটস আর ফানোরোনার সেই পুরনো পরিবারের। গ্রামের মানুষ উঠোনের মাটিতে এর দুটি ত্রিভুজ আঁকত, আর বীজ, নুড়ি বা কড়ি দিয়ে খেলত।",
    p2: "অন্য নামেও এটি ঘোরে: কোনো কোনো জেলায় কাউউ ডাংকি, আর দক্ষিণ ও দক্ষিণ-পূর্ব এশিয়া জুড়ে এর ভাইবোনেরা বাধ্যতামূলক কাটার একই নিয়মে খেলা হয়।",
    sources: "সূত্র:",
  },
  family: {
    eyebrow: "পরিবার",
    title: "আরও ভাইবোন আসছে",
    text: "লাউ কাটা কাটি এই ডালের প্রথম পাতা। প্রেত্বা, দশ-গুটি, এগারো-গুটি, নাগা পাহাড়ের খেলা আরও একে একে নতুন করে তৈরি হচ্ছে।",
    seeAll: "সব আসন্ন খেলা দেখো",
  },
  reasons: {
    capturedAll: (side: string) => `${side} সব শত্রু ঘুঁটি কেটে নিয়েছে`,
    noMoves: (side: string) => `${side}-এর কোনো বৈধ চাল নেই`,
    threefold: "ড্র — একই অবস্থান তিনবার এসেছে",
    sixtyWin: (side: string, pa: number, pb: number) => `কাটা ছাড়া ৬০ চাল — বেশি ঘুঁটির জয় (${side}, ${pa} বনাম ${pb})`,
    sixtyDraw: (pa: number) => `ড্র — কাটা ছাড়া ৬০ চাল, সমান ঘুঁটি (${pa})`,
    sideA: "ক পক্ষ",
    sideB: "খ পক্ষ",
  },
  auth: {
    signIn: "সাইন ইন",
    signOut: "সাইন আউট",
    emailPlaceholder: "you@example.com",
    sendLink: "ম্যাজিক লিংক পাঠাও",
    checkEmail: "ম্যাজিক লিংকের জন্য ইমেইল দেখো।",
    signedInAs: (email: string) => `${email} হিসেবে সাইন ইন`,
  },
  footer: {
    tagline: "চাল-কাটা — ঐতিহ্যবাহী খেলা, যত্নে খুঁড়ে তোলা।",
    source: "গিটহাবে সোর্স",
    disclaimer: "মৌলিক ডিজাইন। ঐতিহ্যবাহী খেলা থেকে অনুপ্রাণিত; অন্য কোনো সাইটের সঙ্গে সম্পর্কিত নয়।",
  },
  leaderboard: {
    title: "সেরাদের তালিকা",
    player: "খেলোয়াড়",
    win: "জয়",
    wins: "জয়",
    vsAi: "এআই-এর বিরুদ্ধে",
    games: "খেলা",
    top: "শীর্ষ",
  },
  notFound: {
    title: "এই পথ বোর্ডে নেই",
    text: "তুমি যে বিন্দু খুঁজছ তা নেই।",
    home: "বোর্ডে ফিরে যাও",
  },
};

const DICTS: Record<Lang, Dict> = { en, bn };

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "bn" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
    document.documentElement.lang = l === "bn" ? "bn" : "en";
  };

  useEffect(() => {
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Translate an engine winReason into the current language. */
export function translateReason(reason: string | null | undefined, t: Dict): string {
  if (!reason) return "";
  const r = t.reasons;
  let m = reason.match(/^(Side [AB]) captured all enemy pieces$/);
  if (m) return r.capturedAll(m[1] === "Side A" ? r.sideA : r.sideB);
  m = reason.match(/^(Side [AB]) has no legal moves$/);
  if (m) return r.noMoves(m[1] === "Side A" ? r.sideA : r.sideB);
  if (reason === "Draw — the same position occurred three times") return r.threefold;
  m = reason.match(/^60 moves without a capture — more pieces wins \((Side [AB]), (\d+) vs (\d+)\)$/);
  if (m) return r.sixtyWin(m[1] === "Side A" ? r.sideA : r.sideB, Number(m[2]), Number(m[3]));
  m = reason.match(/^Draw — 60 moves without a capture, equal pieces \((\d+)\)$/);
  if (m) return r.sixtyDraw(Number(m[1]));
  m = reason.match(/^(Side [AB]) wins on captures \((\d+) vs (\d+)\)$/);
  if (m) return r.capturedAll(m[1] === "Side A" ? r.sideA : r.sideB);
  return reason;
}
