// Chiptune-style sound effects made from simple square waves.
let ctx = null;
let muted = false;

export const getCtx = () => ctx;
export const isMuted = () => muted;
export function setMuted(v) { muted = v; }

// Browsers only allow sound after the player touches/presses something.
export function unlock() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function tone(freq, dur, { type = 'square', vol = 0.05, to = null, delay = 0 } = {}) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function notes(freqs, d, opts = {}) {
  freqs.forEach((f, i) => tone(f, d * 1.5, { ...opts, delay: i * d }));
}

export const sfx = {
  plant: () => tone(200, 0.1, { to: 120, type: 'triangle', vol: 0.09 }),
  water: () => { tone(900, 0.08, { to: 1400, type: 'sine', vol: 0.06 }); tone(1100, 0.08, { to: 1700, type: 'sine', vol: 0.05, delay: 0.09 }); },
  grow: () => tone(400, 0.12, { to: 800, type: 'triangle', vol: 0.05 }),
  coin: () => notes([988, 1319], 0.06, { vol: 0.04 }),
  gold: () => notes([784, 988, 1175, 1568, 1976], 0.06, { vol: 0.04 }),
  nope: () => tone(160, 0.15, { type: 'triangle', vol: 0.08 }),
  blip: () => tone(880, 0.04, { vol: 0.03 }),
  select: () => tone(660, 0.05, { vol: 0.04 }),
  rip: () => tone(1200, 0.25, { to: 200, type: 'sawtooth', vol: 0.02 }),
  reveal: () => notes([523, 659, 784, 1047, 784, 1047, 1319], 0.08),
  rain: () => notes([1568, 1319, 1760, 1175, 1568], 0.05, { type: 'sine', vol: 0.03 }),
};
