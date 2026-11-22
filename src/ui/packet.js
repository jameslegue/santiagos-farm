import { CROP, CROP_DARK, SPR } from '../sprites.js';
import { CROPS } from '../crops.js';
import { HERO_FACE } from '../heroes.js';

// Seed packets look like Santiago's drawing: a white packet with a hanging hole at the top,
// the seed's number in a circle and green writing.

// Number in a little circle, like on the drawing.
export function circledNumber(r, n, x, y, c = 'G') {
  r.rect(x + 2, y, 5, 1, c); r.rect(x + 2, y + 8, 5, 1, c);
  r.rect(x, y + 2, 1, 5, c); r.rect(x + 8, y + 2, 1, 5, c);
  r.rect(x + 1, y + 1, 1, 1, c); r.rect(x + 7, y + 1, 1, 1, c);
  r.rect(x + 1, y + 7, 1, 1, c); r.rect(x + 7, y + 7, 1, 1, c);
  r.text(String(n), x + 3, y + 2, c);
}

function packetBody(r, x, y, w, h, { paper = 'W', edge = 'Q', glow = null, hole = true } = {}) {
  if (glow) r.rect(x - 2, y - 2, w + 4, h + 4, glow);
  r.box(x, y, w, h, paper, edge);
  if (!hole) return;
  // hanging hole
  const hw = Math.max(8, Math.floor(w / 4));
  r.rect(x + Math.floor((w - hw) / 2), y + 3, hw, 3, edge);
}

// Small packet for the seed picker. state: 'open' | 'next' | 'locked'
export function drawSmallPacket(r, x, y, w, h, crop, { state = 'open', selected = false, wiggle = 0 } = {}) {
  const n = CROPS.indexOf(crop) + 1;
  x += wiggle;
  if (state === 'locked') {
    packetBody(r, x, y, w, h, { paper: 'E', edge: 'N' });
    r.spr(SPR.lock, x + w / 2 - 3, y + h / 2 - 4);
    return;
  }
  const glow = selected ? 'Y' : crop.legendary && state === 'open' ? 'O' : null;
  packetBody(r, x, y, w, h, { paper: state === 'next' ? 'Q' : 'W', glow });
  circledNumber(r, n, x + 2, y + 2, state === 'next' ? 'E' : 'G');
  r.spr(state === 'next' ? CROP_DARK[crop.id] : CROP[crop.id], x + w / 2 - 12, y + 12, false, 2);
  if (state === 'next') {
    r.textC('?', x + w / 2, y + 18, 'W', 2, 'K');
    return;
  }
  r.spr(HERO_FACE[crop.id], x + w - 17, y + 2);
  r.textC(crop.name, x + w / 2 + 1, y + h - 15, 'G');
  r.textC(crop.word, x + w / 2 + 1, y + h - 8, 'G');
}

// The big packet, like the drawing. `torn` = how far the top strip has flown off (0 = sealed).
export function drawBigPacket(r, x, y, crop, { torn = -1, showCrop = true } = {}) {
  const w = 104, h = 150;
  const n = CROPS.indexOf(crop) + 1;
  packetBody(r, x, y + 14, w, h - 14, { hole: false });
  if (torn < 0) {
    packetBody(r, x, y, w, 16);
    r.rect(x + 1, y + 14, w - 2, 2, 'W');
  } else {
    // the top strip flies off up and to the right
    packetBody(r, x + torn * 2, y - torn * 3, w, 14);
    // jagged tear line
    for (let i = 0; i < w; i += 4) r.rect(x + i, y + 14 + ((i / 4) % 2), 4, 1, 'Q');
  }
  circledNumber(r, n, x + 5, y + 24);
  if (showCrop) r.spr(CROP[crop.id], x + 22, y + 40, false, 4);
  // name, big, like the drawing
  r.textC(crop.name, x + (crop.legendary ? 46 : 52), y + 104, 'G', 2);
  r.textC(crop.word, x + (crop.legendary ? 46 : 52), y + 124, 'G', 2);
  if (crop.legendary) {
    // "LEGENDARY" down the side with a check mark, just like Santiago wrote it
    r.spr(SPR.check, x + w - 13, y + 22);
    r.rect(x + w - 15, y + 31, 1, 64, 'G');
    [...'LEGENDARY'].forEach((ch, i) => r.text(ch, x + w - 10, y + 32 + i * 7, 'G'));
  }
}
