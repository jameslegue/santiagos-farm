import { CROP, CROP_DARK, SPR } from '../sprites.js';
import { CROPS } from '../crops.js';
import { wrap } from '../engine/render.js';
import { drawButton, tapped } from '../ui/button.js';
import { drawSky, drawSoundButton, SOUND_BTN } from '../ui/hud.js';
import { sfx } from '../engine/audio.js';
import { playSong } from '../engine/music.js';
import { VERSION } from '../version.js';

const PLAY = { x: 32, y: 196, w: 80, h: 28, label: 'PLAY' };

export class TitleScene {
  constructor(game) {
    this.game = game;
    this.t = 0;
    playSong('title');
  }

  update() {
    const input = this.game.input;
    this.t++;
    if (tapped(input, SOUND_BTN)) { this.game.setMuted(!this.game.settings.muted); sfx.select(); return; }
    if (tapped(input, PLAY) || input.enter) {
      sfx.blip();
      if (this.game.progress.started) this.game.openFarm();
      else this.game.openPacket(CROPS[0]);
    }
  }

  draw(r) {
    drawSky(r, this.t);
    drawSoundButton(r, this.game.settings.muted);
    r.rect(0, 58, r.W, r.H - 58, 'G');
    for (let y = 61; y < r.H; y += 7) for (let x = (y * 7) % 11; x < r.W; x += 13) r.rect(x, y, 1, 2, 'L');

    r.box(10, 66, 124, 52, 'D', 'K');
    r.rect(12, 68, 120, 2, 'O');
    r.textC("SANTIAGO'S", 72, 74, 'W', 2, 'K');
    r.textC('FARM', 72, 90, 'Y', 4, 'K');

    // the seeds he's collected so far, in a row
    const unlocked = this.game.progress.started ? this.game.progress.unlocked : 0;
    CROPS.forEach((c, i) => {
      const x = 4 + i * 15.5;
      const hop = Math.floor(this.t / 8) % 9 === i ? -3 : 0;
      r.spr(i < unlocked ? CROP[c.id] : CROP_DARK[c.id], x, 132 + hop);
    });

    // the legendary strawberry, big and bouncy
    const bob = Math.round(Math.sin(this.t / 12) * 3);
    r.spr(CROP.strawberry, 54, 152 + bob, false, 3);
    if ((this.t >> 3) % 4 === 0) r.spr(SPR.sparkle, 50, 150);
    if ((this.t >> 3) % 4 === 2) r.spr(SPR.sparkle, 88, 176);

    drawButton(r, PLAY);
    r.textC('A GAME BY SANTIAGO', 72, 236, 'W', 1, 'T');
    r.text(VERSION, 3, 249, 'T');
    if (this.game.error) {
      const lines = wrap(this.game.error, 34).slice(0, 4);
      r.box(2, 20, 140, 10 + lines.length * 7, 'K', 'R');
      lines.forEach((l, i) => r.text(l, 5, 24 + i * 7, 'Y'));
    }
  }
}
