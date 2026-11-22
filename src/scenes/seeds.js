import { CROPS } from '../crops.js';
import { sfx } from '../engine/audio.js';
import { drawSmallPacket } from '../ui/packet.js';
import { drawButton, tapped } from '../ui/button.js';
import { drawCoins } from '../ui/hud.js';
import { SPR } from '../sprites.js';

// All 9 seed packets in Santiago's order. Tap one you have to plant it,
// tap the next one to buy it with coins.
const W = 44, H = 56;
const slot = (i) => ({ x: 4 + (i % 3) * (W + 2), y: 24 + Math.floor(i / 3) * (H + 4), w: W, h: H });
const BACK = { x: 4, y: 210, w: 66, h: 24, label: 'FARM' };
const HEROES_BTN = { x: 74, y: 210, w: 66, h: 24, label: 'HEROES' };

export class SeedsScene {
  constructor(game) {
    this.game = game;
    this.t = 0;
    this.shake = { i: -1, t: 0 };
  }

  update() {
    const input = this.game.input;
    const p = this.game.progress;
    this.t++;
    this.shake.t--;
    if (tapped(input, BACK)) { sfx.blip(); this.game.openFarm(); return; }
    if (tapped(input, HEROES_BTN)) { sfx.blip(); this.game.openHeroes(); return; }
    CROPS.forEach((crop, i) => {
      const s = slot(i);
      if (!input.tapIn(s.x, s.y, s.w, s.h)) return;
      if (i < p.unlocked) {
        p.sel = crop.id;
        this.game.saveProgress();
        sfx.select();
        this.game.openFarm();
      } else if (i === p.unlocked && p.coins >= crop.price) {
        p.coins -= crop.price;
        p.unlocked++;
        p.sel = crop.id;
        this.game.saveProgress();
        this.game.openPacket(crop);
      } else {
        sfx.nope();
        this.shake = { i, t: 16 };
      }
    });
  }

  draw(r) {
    const p = this.game.progress;
    r.clear('T');
    for (let y = 0; y < r.H; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < r.W; x += 8) r.rect(x, y, 1, 1, 'G');
    drawCoins(r, p.coins);
    r.text('SEEDS', 70, 6, 'W', 2);
    CROPS.forEach((crop, i) => {
      const s = slot(i);
      const state = i < p.unlocked ? 'open' : i === p.unlocked ? 'next' : 'locked';
      const wiggle = this.shake.i === i && this.shake.t > 0 ? Math.round(Math.sin(this.shake.t * 1.5) * 2) : 0;
      drawSmallPacket(r, s.x, s.y, s.w, s.h, crop, { state, selected: crop.id === p.sel, wiggle });
      if (state === 'next') {
        const ready = p.coins >= crop.price;
        r.spr(SPR.coin, s.x + 8, s.y + s.h - 13);
        r.text(String(crop.price), s.x + 18, s.y + s.h - 13, ready ? 'G' : 'E');
        if (ready) {
          r.textC('BUY!', s.x + s.w / 2, s.y + s.h - 6, (this.t >> 3) % 2 ? 'R' : 'G');
          r.spr(SPR.arrow, s.x + s.w / 2 - 4, s.y - 8 + Math.round(Math.sin(this.t / 6) * 2));
        }
      }
    });
    drawButton(r, BACK);
    drawButton(r, HEROES_BTN, { fill: 'R', border: 'O' });
  }
}
