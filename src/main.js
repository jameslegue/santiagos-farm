import { Renderer } from './engine/render.js';
import { Input } from './engine/input.js';
import { start } from './engine/loop.js';
import { unlock, setMuted } from './engine/audio.js';
import { load, save } from './engine/save.js';
import { TitleScene } from './scenes/title.js';
import { FarmScene, emptyPlots } from './scenes/farm.js';
import { SeedsScene } from './scenes/seeds.js';
import { PacketScene } from './scenes/packet.js';
import { CROPS } from './crops.js';

const canvas = document.getElementById('game');

// Scale the 144x256 screen by a whole number of real pixels so it stays crisp.
function fit() {
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(1, Math.floor(Math.min((innerWidth * dpr) / canvas.width, ((innerHeight - 8) * dpr) / canvas.height)));
  canvas.style.width = `${(canvas.width * scale) / dpr}px`;
  canvas.style.height = `${(canvas.height * scale) / dpr}px`;
}
addEventListener('resize', fit);
fit();

const NEW_GAME = {
  started: false,  // opened the first (legendary strawberry) packet
  coins: 0,
  unlocked: 1,     // how many seed packets you have, in Santiago's order
  sel: CROPS[0].id,
  plots: emptyPlots(),
  tut: 0,          // 0 plant, 1 water, 2 pick, 3 done (where the yellow arrow points)
  harvested: 0,
  golds: 0,
};

const game = {
  r: new Renderer(canvas),
  input: new Input(canvas, unlock),
  progress: load('progress', NEW_GAME),
  settings: load('settings', { muted: false }),
  scene: null,

  saveProgress() { save('progress', this.progress); },
  setMuted(v) { this.settings.muted = v; setMuted(v); save('settings', this.settings); },

  go(scene) { this.scene = scene; },
  toTitle() { this.go(new TitleScene(this)); },
  openFarm() { this.go(new FarmScene(this)); },
  openSeeds() { this.go(new SeedsScene(this)); },
  openPacket(crop) { this.go(new PacketScene(this, crop)); },
  reset() { this.progress = structuredClone(NEW_GAME); this.saveProgress(); this.toTitle(); },
};

setMuted(game.settings.muted);
addEventListener('error', (e) => { game.error = `ERROR: ${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno})`; });
addEventListener('unhandledrejection', (e) => { game.error = `ERROR: ${e.reason?.message || e.reason}`; });

// ?reset wipes the save (handy for testing). ?coins=500 gives coins.
const q = new URLSearchParams(location.search);
if (q.has('reset')) game.reset();
if (q.has('coins')) { game.progress.coins = +q.get('coins') || 0; game.saveProgress(); }
game.toTitle();

// If something crashes, go back to the title and show what happened instead of freezing.
function safely(fn) {
  try { fn(); } catch (e) {
    console.error(e);
    game.error = `ERROR: ${e.message}`;
    game.toTitle();
  }
}
start(
  () => { safely(() => game.scene?.update()); game.input.endStep(); },
  () => { game.r.clear('K'); safely(() => game.scene?.draw(game.r)); },
);

window.__game = game;
