import { SPR, CROP, CROP_GOLD } from '../sprites.js';
import { CROPS, cropById, GOLD_CHANCE, GOLD_SELL } from '../crops.js';
import { sfx } from '../engine/audio.js';
import { playSong } from '../engine/music.js';
import { circledNumber } from '../ui/packet.js';
import { drawSky, drawSoundButton, SOUND_BTN, drawCoins, COIN_BOX } from '../ui/hud.js';
import { tapped } from '../ui/button.js';

// The farm: tap dirt to plant, tap a thirsty plant to water it, tap a ripe one to pick it.
const COLS = 3, ROWS = 4;
const PW = 42, PH = 31;
const plotX = (i) => 6 + (i % COLS) * 45;
const plotY = (i) => 62 + Math.floor(i / COLS) * 34;
const FIELD_TOP = 58, FIELD_BOTTOM = 200;
const PACKET_BTN = { x: 4, y: 204, w: 40, h: 48 };
const NEXT_BTN = { x: 48, y: 204, w: 92, h: 48 };
const RAIN_EVERY = 60 * 75; // frames between rain showers
const HOME = { x: 84, y: 34 };   // where the tractor parks, by the barn
const SPEED = 4;                 // tractor speed (pixels per frame)
const spot = (i) => ({ x: plotX(i) + PW / 2 - 15, y: plotY(i) + PH - 24 });

export const emptyPlots = () => Array.from({ length: COLS * ROWS }, () => null);

export class FarmScene {
  constructor(game) {
    this.game = game;
    this.p = game.progress;
    this.t = 0;
    this.fx = [];       // flying crops, coin pops, water cans, sparkles
    this.shownCoins = this.p.coins;
    this.rain = null;
    this.rainTimer = RAIN_EVERY;
    this.saveTimer = 0;
    // Santiago drives his tractor to each plot you tap, in order, and does the job there.
    this.tractor = { x: HOME.x, y: HOME.y, flip: false, moving: false, idle: 0, wheel: 0 };
    this.queue = [];
    playSong('farm');
  }

  get next() { return CROPS[this.p.unlocked] || null; }

  save() { this.game.saveProgress(); }

  update() {
    const input = this.game.input;
    const now = Date.now();
    this.t++;

    // Growing happens by the clock, so plants keep growing while the game is closed.
    this.p.plots.forEach((pl, i) => {
      if (!pl || !pl.wet || pl.stage >= 3 || now < pl.readyAt) return;
      pl.stage++;
      pl.wet = false;
      if (pl.stage === 3 && cropById(pl.crop).legendary && Math.random() < GOLD_CHANCE) pl.gold = true;
      this.pop(i, pl.stage === 3 ? 'ripe' : 'grow');
      this.save();
    });

    if (tapped(input, SOUND_BTN)) { this.game.setMuted(!this.game.settings.muted); sfx.select(); return; }
    if (tapped(input, PACKET_BTN) || tapped(input, NEXT_BTN)) { sfx.blip(); this.game.openSeeds(); return; }

    for (let i = 0; i < COLS * ROWS; i++) {
      if (input.tapIn(plotX(i) - 1, plotY(i) - 1, PW + 2, PH + 2)) {
        if (!this.queue.includes(i)) { this.queue.push(i); sfx.select(); }
        break;
      }
    }
    this.updateTractor(now);

    this.updateRain(now);
    this.fx = this.fx.filter((f) => { f.t++; return f.t < f.life; });
    if (this.shownCoins < this.p.coins) this.shownCoins = Math.min(this.p.coins, this.shownCoins + Math.max(1, Math.ceil((this.p.coins - this.shownCoins) / 10)));
    else this.shownCoins = this.p.coins;
    if (++this.saveTimer > 300) { this.saveTimer = 0; this.save(); }
  }

  updateTractor(now) {
    const tr = this.tractor;
    let target = null;
    if (this.queue.length) { target = spot(this.queue[0]); tr.idle = 0; }
    else if (++tr.idle > 90) target = HOME;
    tr.moving = false;
    if (!target) return;
    const dx = target.x - tr.x, dy = target.y - tr.y;
    const d = Math.hypot(dx, dy);
    if (d <= SPEED) {
      tr.x = target.x; tr.y = target.y;
      if (this.queue.length) this.tapPlot(this.queue.shift(), now);
      return;
    }
    tr.x += (dx / d) * SPEED;
    tr.y += (dy / d) * SPEED;
    if (Math.abs(dx) > 1) tr.flip = dx < 0;
    tr.moving = true;
    tr.wheel++;
  }

  tapPlot(i, now) {
    const p = this.p;
    const pl = p.plots[i];
    const cx = plotX(i) + PW / 2, cy = plotY(i) + PH / 2;
    if (!pl) {
      p.plots[i] = { crop: p.sel, stage: 0, wet: false, readyAt: 0, gold: false };
      if (p.tut < 1) p.tut = 1;
      sfx.plant();
      for (let k = 0; k < 6; k++) this.fx.push({ kind: 'dirt', x: cx, y: cy + 6, vx: (Math.random() - 0.5) * 2, vy: -1 - Math.random() * 1.5, t: 0, life: 24 });
    } else if (pl.stage === 3) {
      const value = pl.gold ? GOLD_SELL : cropById(pl.crop).sell;
      p.coins += value;
      p.harvested = (p.harvested || 0) + 1;
      if (pl.gold) p.golds = (p.golds || 0) + 1;
      if (p.tut < 3) p.tut = 3;
      (pl.gold ? sfx.gold : sfx.coin)();
      this.fx.push({ kind: 'fly', crop: pl.crop, gold: pl.gold, x: cx - 6, y: cy - 10, t: 0, life: 30 });
      this.fx.push({ kind: 'text', text: `+${value}`, x: cx, y: cy - 6, t: 0, life: 40, c: pl.gold ? 'Y' : 'W' });
      p.plots[i] = null;
    } else if (!pl.wet) {
      this.water(pl, i, now);
      if (p.tut < 2) p.tut = 2;
    } else {
      pl.wiggle = this.t;
      sfx.blip();
    }
    this.save();
  }

  water(pl, i, now) {
    pl.wet = true;
    pl.readyAt = now + cropById(pl.crop).grow * 1000;
    sfx.water();
    this.fx.push({ kind: 'can', x: plotX(i) + PW - 18, y: plotY(i) - 6, t: 0, life: 28 });
  }

  pop(i, kind) {
    const cx = plotX(i) + PW / 2, cy = plotY(i) + PH / 2;
    if (kind === 'ripe') sfx.grow();
    for (let k = 0; k < (kind === 'ripe' ? 6 : 3); k++) {
      const a = (k / 6) * Math.PI * 2;
      this.fx.push({ kind: 'spark', x: cx + Math.cos(a) * 10, y: cy + Math.sin(a) * 8 - 4, t: 0, life: 30 });
    }
  }

  // Every so often a rain cloud floats over the farm and waters everything that's thirsty.
  updateRain(now) {
    const thirsty = this.p.plots.some((pl) => pl && pl.stage < 3 && !pl.wet);
    if (!this.rain) {
      if (this.p.tut >= 3 && thirsty && --this.rainTimer <= 0) {
        this.rain = { x: -24 };
        this.rainTimer = RAIN_EVERY;
        sfx.rain();
      }
      return;
    }
    this.rain.x += 0.6;
    const cx = this.rain.x + 20;
    this.p.plots.forEach((pl, i) => {
      if (pl && pl.stage < 3 && !pl.wet && Math.abs(plotX(i) + PW / 2 - cx) < 8) { this.water(pl, i, now); this.save(); }
    });
    if (this.rain.x > 150) this.rain = null;
  }

  // Where the yellow arrow points, for little helpers who don't read yet.
  hint() {
    const p = this.p;
    const find = (fn) => p.plots.findIndex(fn);
    if (p.tut === 0) return { plot: find((pl) => !pl) };
    if (p.tut === 1) return { plot: find((pl) => pl && pl.stage < 3 && !pl.wet) };
    if (p.tut === 2) return { plot: find((pl) => pl && pl.stage === 3) };
    if (this.next && p.coins >= this.next.price) return { btn: NEXT_BTN };
    return null;
  }

  draw(r) {
    drawSky(r, this.t);
    drawCoins(r, this.shownCoins);
    drawSoundButton(r, this.game.settings.muted);

    // field
    r.rect(0, FIELD_TOP, r.W, FIELD_BOTTOM - FIELD_TOP, 'G');
    for (let y = FIELD_TOP + 3; y < FIELD_BOTTOM; y += 7) for (let x = (y * 7) % 11; x < r.W; x += 13) r.rect(x, y, 1, 2, 'L');
    for (let i = 0; i < COLS * ROWS; i++) this.drawPlot(r, i);
    // plots waiting for the tractor get a yellow outline
    for (const i of this.queue) {
      const x = plotX(i), y = plotY(i);
      r.rect(x - 1, y - 1, PW + 2, 1, 'Y'); r.rect(x - 1, y + PH, PW + 2, 1, 'Y');
      r.rect(x - 1, y, 1, PH, 'Y'); r.rect(x + PW, y, 1, PH, 'Y');
    }
    const tr = this.tractor;
    r.spr(SPR.tractor[(tr.wheel >> 2) % 2], tr.x, tr.y - (tr.moving && (this.t >> 2) % 2 ? 1 : 0), tr.flip);

    if (this.rain) {
      const rx = Math.round(this.rain.x);
      for (let k = 0; k < 10; k++) {
        const dy = (this.t * 3 + k * 23) % 140;
        r.rect(rx + 2 + ((k * 7) % 36), FIELD_TOP + dy, 1, 3, 'S');
      }
      r.spr(SPR.rain, rx, FIELD_TOP - 8, false, 2);
    }

    this.drawFx(r);
    this.drawBar(r);

    const h = this.hint();
    if (h) {
      const bob = Math.round(Math.sin(this.t / 6) * 2);
      if (h.plot >= 0 && h.plot !== undefined) r.spr(SPR.arrow, plotX(h.plot) + PW / 2 - 4, plotY(h.plot) - 6 + bob);
      if (h.btn) r.spr(SPR.arrow, h.btn.x + h.btn.w / 2 - 4, h.btn.y - 10 + bob);
    }
  }

  drawPlot(r, i) {
    const pl = this.p.plots[i];
    const x = plotX(i), y = plotY(i);
    const wet = pl && pl.wet;
    r.box(x, y, PW, PH, wet ? 'P' : 'D', 'K');
    for (let fy = y + 4; fy < y + PH - 2; fy += 6) r.rect(x + 2, fy, PW - 4, 1, wet ? 'K' : 'O');
    if (wet) for (let k = 0; k < 4; k++) r.rect(x + 5 + k * 10, y + 6 + ((k * 5) % 15), 1, 1, 'S');
    if (!pl) return;

    const crop = cropById(pl.crop);
    const cx = x + PW / 2;
    const base = y + PH - 3;
    const wig = pl.wiggle && this.t - pl.wiggle < 12 ? Math.round(Math.sin((this.t - pl.wiggle) * 1.2) * 1.5) : 0;
    if (pl.stage === 0) r.spr(SPR.mound, cx - 12 + wig, base - 7, false, 2);
    else if (pl.stage === 1) r.spr(SPR.sprout, cx - 6 + wig, base - 7);
    else {
      const plant = crop.tree ? SPR.tree : SPR.bush;
      r.spr(plant, cx - plant.width / 2 + wig, base - plant.height);
    }
    if (pl.stage === 3) {
      const bob = Math.round(Math.sin(this.t / 10 + i) * 1.5);
      r.spr(pl.gold ? CROP_GOLD : CROP[pl.crop], cx - 6, y + 2 + bob);
      if (pl.gold || (this.t + i * 9) % 50 < 10) r.spr(SPR.sparkle, x + 3 + ((this.t >> 3) % 2) * 30, y + 3);
    } else if (!pl.wet) {
      // thirsty: water drop bubble
      const bob = Math.round(Math.sin(this.t / 8 + i) * 1.5);
      r.box(x + PW - 12, y + 2 + bob, 11, 11, 'W', 'K');
      r.spr(SPR.drop, x + PW - 9, y + 4 + bob);
    } else {
      // growing: little progress bar
      const left = Math.max(0, pl.readyAt - Date.now());
      const total = crop.grow * 1000;
      const w = Math.round((PW - 8) * (1 - left / total));
      r.rect(x + 4, y + 2, PW - 8, 3, 'K');
      r.rect(x + 4, y + 2, w, 3, 'L');
    }
  }

  drawFx(r) {
    for (const f of this.fx) {
      const k = f.t / f.life;
      if (f.kind === 'dirt') r.rect(f.x + f.vx * f.t, f.y + f.vy * f.t + 0.08 * f.t * f.t, 2, 2, 'D');
      else if (f.kind === 'spark') { if ((f.t >> 2) % 2 === 0) r.spr(SPR.sparkle, f.x - 2, f.y - 2 - f.t / 4); }
      else if (f.kind === 'can') {
        r.spr(SPR.can, f.x, f.y);
        for (let d = 0; d < 3; d++) r.rect(f.x + 13 - d, f.y + 4 + ((f.t * 2 + d * 5) % 14), 1, 2, 'S');
      } else if (f.kind === 'fly') {
        // crop flies up to the coin counter
        const tx = COIN_BOX.x + 4, ty = COIN_BOX.y;
        const e = k * k;
        r.spr(f.gold ? CROP_GOLD : CROP[f.crop], f.x + (tx - f.x) * e, f.y + (ty - f.y) * e - Math.sin(k * Math.PI) * 20);
      } else if (f.kind === 'text') {
        r.textC(f.text, f.x, f.y - f.t / 2, f.c, 1, 'K');
      }
    }
  }

  drawBar(r) {
    r.rect(0, FIELD_BOTTOM, r.W, r.H - FIELD_BOTTOM, 'D');
    r.rect(0, FIELD_BOTTOM, r.W, 2, 'K');
    for (let y = FIELD_BOTTOM + 8; y < r.H; y += 9) r.rect(0, y, r.W, 1, 'O');

    // the seed you're planting (tap to change)
    const crop = cropById(this.p.sel);
    const b = PACKET_BTN;
    r.box(b.x, b.y, b.w, b.h, 'W', crop.legendary ? 'Y' : 'Q');
    r.rect(b.x + 14, b.y + 3, 12, 3, 'Q');
    circledNumber(r, CROPS.indexOf(crop) + 1, b.x + 2, b.y + 2);
    r.spr(CROP[crop.id], b.x + 8, b.y + 12, false, 2);
    r.textC('SEEDS', b.x + b.w / 2 + 1, b.y + b.h - 8, 'G');

    // next seed packet to unlock
    const n = NEXT_BTN;
    const next = this.next;
    r.box(n.x, n.y, n.w, n.h, 'K', 'Y');
    if (!next) {
      r.textC('ALL SEEDS!', n.x + n.w / 2, n.y + 8, 'Y', 1);
      r.spr(CROP_GOLD, n.x + n.w / 2 - 12, n.y + 18, false, 2);
      return;
    }
    const ready = this.p.coins >= next.price;
    r.textC('NEW SEED', n.x + n.w / 2, n.y + 5, ready && (this.t >> 4) % 2 ? 'Y' : 'W');
    r.spr(ready ? CROP[next.id] : SPR.lock, n.x + 6, n.y + (ready ? 18 : 20), false, ready ? 2 : 2);
    r.spr(SPR.coin, n.x + 38, n.y + 17);
    r.text(String(next.price), n.x + 48, n.y + 16, 'Y', 2);
    // how close you are
    const bw = n.w - 40;
    r.rect(n.x + 36, n.y + 34, bw, 6, 'E');
    r.rect(n.x + 36, n.y + 34, Math.round(bw * Math.min(1, this.p.coins / next.price)), 6, ready ? 'Y' : 'L');
    if (ready) r.spr(SPR.sparkle, n.x + 4 + ((this.t >> 3) % 2) * 20, n.y + 14);
  }
}
