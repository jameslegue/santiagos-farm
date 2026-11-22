// Saves live on the phone. If storage is blocked (private mode etc.) the game still works,
// it just won't remember things.
const PREFIX = 'santiagos-farm.';

// Deep copy that works on older iPhones too (structuredClone needs iOS 15.4+).
const copy = (v) => JSON.parse(JSON.stringify(v));

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    if (v) return { ...copy(fallback), ...JSON.parse(v) };
  } catch { /* storage unavailable */ }
  return copy(fallback);
}

export function save(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
