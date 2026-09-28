/* Tiny WebAudio synth for game sounds. No audio assets needed.
 * All sounds are no-ops when muted or when AudioContext is unavailable.
 * Mute state lives in localStorage under "ck-muted" and is shared with Ambience.
 * Sound is OFF by default; the toggle persists the player's choice. */

const MUTE_KEY = "ck-muted";

let ctx: AudioContext | null = null;

export function getMuted(): boolean {
  try {
    const v = localStorage.getItem(MUTE_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

export function setMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ck-muted-changed"));
  }
}

/** Create/resume the context. Must be called from a user gesture at least once. */
export function ensureAudio(): void {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* ignore */
  }
}

function env(gain: GainNode, t: number, peak: number, decay: number): void {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

function tone(freq: number, type: OscillatorType, peak: number, decay: number, when = 0): void {
  if (!ctx || getMuted()) return;
  try {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    env(g, t, peak, decay);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  } catch {
    /* ignore */
  }
}

function knock(freq: number, peak: number, decay: number, when = 0): void {
  if (!ctx || getMuted()) return;
  try {
    const t = ctx.currentTime + when;
    // body: low sine thump
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.6, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
    env(g, t, peak, decay);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + decay + 0.05);
    // click: short filtered noise transient
    const len = Math.floor(ctx.sampleRate * 0.03);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2400;
    f.Q.value = 1.2;
    const g2 = ctx.createGain();
    env(g2, t, peak * 0.5, 0.03);
    src.connect(f).connect(g2).connect(ctx.destination);
    src.start(t);
  } catch {
    /* ignore */
  }
}

/** Soft tick when a stone is selected. */
export function playSelect(): void {
  tone(640, "triangle", 0.12, 0.07);
}

/** Wooden thock when a stone lands on a point. */
export function playMove(): void {
  knock(190, 0.32, 0.14);
}

/** Deeper knock when a capture lands. */
export function playCapture(): void {
  knock(120, 0.4, 0.22);
  knock(90, 0.3, 0.28, 0.07);
}

/** Small three-note chime on winning. */
export function playWin(): void {
  tone(523.25, "sine", 0.2, 0.16, 0);
  tone(659.25, "sine", 0.2, 0.16, 0.11);
  tone(783.99, "sine", 0.24, 0.3, 0.22);
}

/** Dull thud for a refused tap. */
export function playInvalid(): void {
  tone(140, "square", 0.06, 0.09);
}

/** Haptic tap on move/capture. Only fires when sound is enabled
 *  (the toggle covers both) and the device supports vibration. */
export function buzz(pattern: number | number[]): void {
  if (getMuted()) return;
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
}
