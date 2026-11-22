import { SPR } from '../sprites.js';

export const COIN_BOX = { x: 3, y: 3, w: 52, h: 15 };
export const SOUND_BTN = { x: 126, y: 3, w: 15, h: 13 };

// Sky, sun, clouds, the barn and the fence across the top of the farm.
export function drawSky(r, t) {
  r.rect(0, 0, r.W, 58, 'S');
  r.spr(SPR.sun, 64, 6);
  r.spr(SPR.cloud, ((t / 12) % 190) - 30, 22);
  r.spr(SPR.cloud, 150 - ((t / 20) % 190), 32);
  r.rect(0, 52, r.W, 6, 'G');
  r.rect(0, 52, r.W, 1, 'L');
  for (let x = 0; x < 112; x += 8) r.spr(SPR.fence, x, 46);
  r.spr(SPR.barn, 118, 37);
}

export function drawCoins(r, coins) {
  const b = COIN_BOX;
  r.box(b.x, b.y, b.w, b.h, 'K', 'Y');
  r.spr(SPR.coin, b.x + 4, b.y + 4);
  r.text(String(coins), b.x + 14, b.y + 3, 'Y', 2);
}

export function drawSoundButton(r, muted) {
  const b = SOUND_BTN;
  r.box(b.x, b.y, b.w, b.h, 'K', 'W');
  r.spr(SPR.speaker, b.x + 3, b.y + 3);
  if (muted) {
    for (let i = 0; i < 5; i++) { r.rect(b.x + 8 + i, b.y + 4 + i, 1, 1, 'R'); r.rect(b.x + 12 - i, b.y + 4 + i, 1, 1, 'R'); }
  } else {
    r.rect(b.x + 10, b.y + 4, 1, 5, 'W');
    r.rect(b.x + 12, b.y + 3, 1, 7, 'W');
  }
}
