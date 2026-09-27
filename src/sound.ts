// Tiny sound manager for Chaal-Kaata.
//
// Uses the short CC0 SFX in public/assets/ (see public/ATTRIBUTION.md).
// Design notes:
// - Prefers .ogg (smaller), falls back to .mp3 for browsers without ogg
//   support (Safari reports '' for audio/ogg via canPlayType).
// - Audio elements are only created/warmed after a user gesture
//   (unlockSound, called once from a pointerdown/keydown listener in App),
//   satisfying mobile autoplay policies. playSound() also warms lazily, so
//   the first real sound (from a tap) is never blocked.
// - Every load/play failure is swallowed silently: no sound is better than
//   a crash or console spam.

export type SoundName = 'place' | 'capture' | 'turn' | 'win' | 'click' | 'invalid';

const MUTE_KEY = 'ck-muted';
const NAMES: SoundName[] = ['place', 'capture', 'turn', 'win', 'click', 'invalid'];

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Runtime asset base without needing vite/client types. */
function assetBase(): string {
  try {
    const meta = import.meta as unknown as { env?: { BASE_URL?: string } };
    const base = meta.env?.BASE_URL;
    if (typeof base === 'string' && base.length > 0) return base;
  } catch {
    /* ignore */
  }
  return '/';
}

let muted = readMuted();
const cache = new Map<SoundName, HTMLAudioElement>();
let unlocked = false;

function srcFor(name: SoundName): string {
  const base = `${assetBase()}assets/`;
  // Feature-detect ogg support up front (Safari: canPlayType('audio/ogg') === '').
  try {
    const probe = document.createElement('audio');
    if (typeof probe.canPlayType === 'function' && probe.canPlayType('audio/ogg') === '') {
      return `${base}${name}.mp3`;
    }
  } catch {
    /* fall through to ogg */
  }
  return `${base}${name}.ogg`;
}

function getAudio(name: SoundName): HTMLAudioElement | null {
  try {
    let el = cache.get(name);
    if (!el) {
      el = new Audio();
      el.preload = 'auto';
      el.src = srcFor(name);
      // Belt-and-braces: if the chosen container fails to load/decode,
      // try the other one exactly once.
      el.addEventListener('error', () => {
        if (!el) return;
        const cur: string = el.src;
        const alt = cur.endsWith('.mp3')
          ? cur.slice(0, -4) + '.ogg'
          : cur.slice(0, -4) + '.mp3';
        if (alt !== cur) {
          el.src = alt;
          try {
            el.load();
          } catch {
            /* silent */
          }
        }
      });
      cache.set(name, el);
    }
    return el;
  } catch {
    return null;
  }
}

/**
 * Warm up all SFX elements. Call once from a real user gesture
 * (pointerdown / keydown); afterwards playSound() works everywhere,
 * including from timers (win fanfare after the AI's move).
 */
export function unlockSound(): void {
  if (unlocked) return;
  unlocked = true;
  try {
    for (const n of NAMES) {
      try {
        getAudio(n)?.load();
      } catch {
        /* silent */
      }
    }
  } catch {
    /* silent */
  }
}

export function playSound(name: SoundName): void {
  if (muted) return;
  try {
    unlockSound();
    const el = getAudio(name);
    if (!el) return;
    try {
      el.currentTime = 0;
    } catch {
      /* some elements dislike seeking before metadata; ignore */
    }
    const p = el.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    /* silent */
  }
}

export function isSoundMuted(): boolean {
  return muted;
}

export function setSoundMuted(m: boolean): void {
  muted = m;
  try {
    window.localStorage.setItem(MUTE_KEY, m ? '1' : '0');
  } catch {
    /* silent */
  }
  if (m) {
    // Stop anything currently ringing so mute is immediate.
    for (const el of cache.values()) {
      try {
        el.pause();
      } catch {
        /* silent */
      }
    }
  }
}
