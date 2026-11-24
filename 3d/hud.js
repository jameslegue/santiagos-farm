import { Renderer } from '../src/engine/render.js';
import { SPR } from '../src/sprites.js';

// Text on top of the 3D view, in the same chunky pixel font as the 2D game.
const HUD_W = 160;

export class Hud {
  constructor(canvas) {
    this.canvas = canvas;
    this.r = new Renderer(canvas);
    this.popups = [];
    this.t = 0;
    this.resize();
  }

  resize() {
    this.canvas.width = HUD_W;
    this.canvas.height = Math.round((HUD_W * innerHeight) / innerWidth);
    this.r.W = this.canvas.width;
    this.r.H = this.canvas.height;
    this.r.ctx.imageSmoothingEnabled = false;
  }

  popup(text, color = 'Y') { this.popups.push({ text, color, t: 2.2 }); }

  draw(dt, { coins }) {
    const r = this.r;
    this.t += dt;
    r.ctx.clearRect(0, 0, r.W, r.H);

    r.box(2, 2, 50, 15, 'K', 'Y');
    r.spr(SPR.coin, 6, 6);
    r.text(String(coins), 16, 5, 'Y', 2);

    if (this.t < 8) {
      const lines = ['LEFT SIDE: DRIVE', 'RIGHT SIDE: LOOK', 'DRIVE ONTO THE DIRT!'];
      r.box(16, 24, r.W - 32, 28, 'K', 'Y');
      lines.forEach((l, i) => r.textC(l, r.W / 2, 28 + i * 8, i === 2 ? 'Y' : 'W'));
    }

    this.popups = this.popups.filter((p) => (p.t -= dt) > 0);
    this.popups.forEach((p, i) => r.textC(p.text, r.W / 2, r.H * 0.3 - i * 10 - (2.2 - p.t) * 6, p.color, 1, 'K'));
  }
}
