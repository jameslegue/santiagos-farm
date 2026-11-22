// Big chunky button. `s` is the text size (2 = easy to read).
export function drawButton(r, b, { s = 2, fill = 'G', border = 'L' } = {}) {
  r.box(b.x, b.y, b.w, b.h, border, 'K');
  r.rect(b.x + 2, b.y + 2, b.w - 4, b.h - 4, fill);
  r.rect(b.x + 2, b.y + b.h - 4, b.w - 4, 2, 'T');
  r.textC(b.label, b.x + b.w / 2, b.y + Math.floor((b.h - 5 * s) / 2) - 1, 'W', s, 'K');
}

export function tapped(input, b) { return input.tapIn(b.x - 3, b.y - 3, b.w + 6, b.h + 6); }
