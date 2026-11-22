import { CROP, SPR } from '../sprites.js';
import { sfx } from '../engine/audio.js';
import { drawBigPacket } from '../ui/packet.js';

// A new seed packet! It drops in, you tap to rip it open, and the seed pops out.
const PX = 20, PY = 50;

export class PacketScene {
  constructor(game, crop) {
    this.game = game;
    this.crop = crop;
    this.t = 0;
    this.phase = 'drop'; // drop -> wait -> open
    this.openT = 0;
  }

  update() {
    const input = this.game.input;
    this.t++;
    if (this.phase === 'drop' && this.t > 40) this.phase = 'wait';
    if (this.phase === 'wait' && input.tapped) {
      this.phase = 'open';
      this.openT = 0;
      sfx.rip();
      setTimeout(() => sfx.reveal(), 250);
    } else if (this.phase === 'open') {
      this.openT++;
      if (this.openT > 50 && input.tapped) {
        this.game.progress.started = true;
        this.game.saveProgress();
        sfx.blip();
        this.game.openFarm();
      }
    }
  }

  draw(r) {
    r.clear('N');
    // sunburst
    const cx = 72, cy = 120;
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2 + this.t / 120;
      for (let d = 20; d < 160; d += 3) r.rect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, 2, k % 2 ? 'B' : 'P');
    }
    let y = PY;
    if (this.phase === 'drop') {
      const k = Math.min(1, this.t / 30);
      y = PY - 220 * (1 - k) ** 2 - (this.t > 30 ? Math.sin((this.t - 30) / 2) * 4 : 0);
    }
    const shakeX = this.phase === 'wait' ? Math.round(Math.sin(this.t / 2) * ((this.t >> 5) % 2 ? 1 : 0)) : 0;
    const torn = this.phase === 'open' ? this.openT * 3 : -1;
    drawBigPacket(r, PX + shakeX, y, this.crop, { torn, showCrop: this.phase !== 'open' });

    if (this.phase === 'wait') {
      r.textC(this.crop.legendary ? 'A LEGENDARY PACKET!' : 'A NEW PACKET!', 72, 22, 'Y', 1, 'K');
      if ((this.t >> 4) % 2) r.textC('TAP TO OPEN!', 72, 222, 'W', 2, 'K');
    }
    if (this.phase === 'open') {
      // seed pops out of the packet and floats up big
      const k = Math.min(1, this.openT / 30);
      const s = 2 + Math.round(k * 3);
      const sz = 12 * s;
      const iy = PY + 40 - k * 50 + Math.sin(this.openT / 8) * 2;
      r.spr(CROP[this.crop.id], 72 - sz / 2, iy, false, s);
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 + this.openT / 15;
        if ((this.openT >> 2) % 2 === i % 2) r.spr(SPR.sparkle, 70 + Math.cos(a) * (sz / 2 + 10), iy + sz / 2 + Math.sin(a) * (sz / 2 + 10));
      }
      if (this.openT > 20) r.textC(this.crop.legendary ? 'LEGENDARY!' : 'NEW SEED!', 72, 14, 'Y', 2, 'K');
      if (this.openT > 50 && (this.openT >> 4) % 2) r.textC('TAP TO PLANT!', 72, 226, 'W', 2, 'K');
    }
  }
}
