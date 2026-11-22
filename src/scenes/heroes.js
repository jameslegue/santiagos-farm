import { CROPS } from '../crops.js';
import { HEROES, HERO, HERO_DARK } from '../heroes.js';
import { CROP, SPR } from '../sprites.js';
import { sfx } from '../engine/audio.js';
import { drawButton, tapped } from '../ui/button.js';

// My Heroes: one superhero per seed. You meet each one when you open their seed packet.
const W = 44, H = 60;
const card = (i) => ({ x: 4 + (i % 3) * (W + 2), y: 22 + Math.floor(i / 3) * (H + 2), w: W, h: H });
const BACK = { x: 4, y: 214, w: 66, h: 24, label: 'FARM' };
const SEEDS = { x: 74, y: 214, w: 66, h: 24, label: 'SEEDS' };

export class HeroesScene {
  constructor(game) {
    this.game = game;
    this.t = 0;
    this.big = null; // hero being looked at up close
  }

  update() {
    const input = this.game.input;
    const p = this.game.progress;
    this.t++;
    if (this.big) {
      if (input.tapped && this.t - this.bigT > 10) { this.big = null; sfx.blip(); }
      return;
    }
    if (tapped(input, BACK)) { sfx.blip(); this.game.openFarm(); return; }
    if (tapped(input, SEEDS)) { sfx.blip(); this.game.openSeeds(); return; }
    CROPS.forEach((crop, i) => {
      const c = card(i);
      if (!input.tapIn(c.x, c.y, c.w, c.h)) return;
      if (i < p.unlocked) { this.big = crop; this.bigT = this.t; sfx.hero(); }
      else sfx.nope();
    });
  }

  draw(r) {
    const p = this.game.progress;
    r.clear('N');
    for (let y = 0; y < r.H; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < r.W; x += 8) r.rect(x, y, 1, 1, 'P');
    if (this.big) { this.drawBig(r); return; }
    r.textC('MY HEROES', 72, 6, 'Y', 2, 'K');
    CROPS.forEach((crop, i) => {
      const c = card(i);
      const have = i < p.unlocked;
      r.box(c.x, c.y, c.w, c.h, have ? 'B' : 'K', have ? 'Y' : 'E');
      if (!have) {
        r.spr(HERO_DARK[crop.id], c.x + 6, c.y + 6, false, 2);
        r.textC('?', c.x + c.w / 2, c.y + 46, 'Q', 2);
        return;
      }
      const hop = Math.floor(this.t / 10) % 9 === i ? -2 : 0;
      r.spr(HERO[crop.id], c.x + 6, c.y + 4 + hop, false, 2);
      r.spr(CROP[crop.id], c.x + c.w - 13, c.y + 2);
      const [a, ...rest] = HEROES[crop.id].name.split(' ');
      r.textC(a, c.x + c.w / 2 + 1, c.y + 43, 'W');
      if (rest.length) r.textC(rest.join(' '), c.x + c.w / 2 + 1, c.y + 50, 'W');
    });
    drawButton(r, BACK);
    drawButton(r, SEEDS);
  }

  drawBig(r) {
    const crop = this.big;
    const h = HEROES[crop.id];
    const k = this.t - this.bigT;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + k / 100;
      for (let d = 30; d < 160; d += 3) r.rect(72 + Math.cos(a) * d, 110 + Math.sin(a) * d, 2, 2, i % 2 ? 'B' : 'T');
    }
    r.textC(h.name, 72, 14, 'Y', 2, 'K');
    const bob = Math.round(Math.sin(k / 10) * 3);
    r.spr(HERO[crop.id], 24, 44 + bob, false, 6);
    for (let i = 0; i < 4; i++) if ((k >> 3) % 4 === i) r.spr(SPR.sparkle, [20, 118, 26, 112][i], [50, 70, 140, 150][i]);
    r.box(4, 166, 136, 34, 'K', 'Y');
    r.textC('POWER:', 72, 171, 'Q');
    r.textC(h.power, 72, 180, 'W', h.power.length > 14 ? 1 : 2);
    r.spr(CROP[crop.id], 66, 216 + (k >> 4) % 2);
    if ((k >> 4) % 2) r.textC('TAP TO GO BACK', 72, 240, 'W');
  }
}
