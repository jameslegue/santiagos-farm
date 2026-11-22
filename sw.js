// Lets the game run offline from the home screen.
// Always asks GitHub for the newest files first (so a new version shows up right away),
// and falls back to the saved copy only when there's no signal.
const CACHE = 'santiagos-farm-v4';
const FILES = [
  './',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './index.html',
  './manifest.webmanifest',
  './src/crops.js',
  './src/engine/audio.js',
  './src/engine/font.js',
  './src/engine/input.js',
  './src/engine/loop.js',
  './src/engine/music.js',
  './src/engine/palette.js',
  './src/engine/render.js',
  './src/engine/save.js',
  './src/heroes.js',
  './src/main.js',
  './src/scenes/farm.js',
  './src/scenes/heroes.js',
  './src/scenes/packet.js',
  './src/scenes/seeds.js',
  './src/scenes/title.js',
  './src/sprites.js',
  './src/ui/button.js',
  './src/ui/hud.js',
  './src/ui/packet.js',
  './src/version.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // 'no-cache' = never trust the browser's own saved copy without checking with the server.
  const req = e.request.mode === 'navigate' ? e.request.url : e.request;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
